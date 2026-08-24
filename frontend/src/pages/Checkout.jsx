import { useState } from "react";
import { Container, Row, Col, Form, Button, Card, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Message from "../components/Message";
import { formatPrice } from "../utils/formatPrice";

const Checkout = () => {
  const { cart, subtotal, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Tracks WHICH button is busy, so we can show the right loading text
  // on the right button instead of both changing at once.
  const [activeMethod, setActiveMethod] = useState(null);

  // A single handler for ALL address fields, using the input's "name"
  // attribute to know which field to update. This avoids writing a
  // separate useState + onChange handler for every single input.
  const handleChange = (e) => {
    setShippingAddress((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // These numbers are a PREVIEW only, shown before payment - they must
  // mirror the actual calculation in backend/controllers/paymentController.js
  // exactly, or the total shown here won't match what Razorpay charges.
  const shippingPrice = subtotal > 999 ? 0 : 49; // free shipping over ₹999
  const taxPrice = Number((subtotal * 0.05).toFixed(2)); // 5% tax
  const totalPrice = subtotal + shippingPrice + taxPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (cart.items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    // When a <form> has more than one submit button, the browser tells us
    // which one triggered this submit via e.nativeEvent.submitter - we
    // read its "value" attribute (set on each Button below) to know
    // whether the user chose Cash on Delivery or Pay Now, while still
    // getting free HTML5 "required" field validation on BOTH buttons.
    const method = e.nativeEvent.submitter?.value || "RAZORPAY";
    setActiveMethod(method);

    if (method === "COD") {
      await placeCodOrder();
    } else {
      await payWithRazorpay();
    }
  };

  const placeCodOrder = async () => {
    setSubmitting(true);
    try {
      const { data: order } = await api.post("/api/orders", {
        shippingAddress,
        paymentMethod: "COD",
      });
      await fetchCart(); // backend already emptied it - sync local state
      navigate("/payment-success", { state: { order } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const payWithRazorpay = async () => {
    // window.Razorpay comes from the <script> tag loaded in index.html.
    // If it hasn't loaded yet (e.g. slow network, ad-blocker), fail
    // clearly instead of crashing on `new window.Razorpay(...)` below.
    if (!window.Razorpay) {
      setError("Payment gateway failed to load. Please refresh and try again.");
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: ask our backend to create a Razorpay order for the
      // current cart + shipping address.
      const { data } = await api.post("/api/payment/create-order", {
        shippingAddress,
      });

      // Step 2: configure and open Razorpay's checkout popup.
      // This does NOT navigate away from our page - it overlays a modal.
      const razorpay = new window.Razorpay({
        key: data.keyId, // Razorpay's PUBLIC key - safe to expose to the browser
        amount: data.amount, // in paise, e.g. 499900 for ₹4,999.00
        currency: data.currency,
        name: "ShopEase",
        description: "Order Payment",
        order_id: data.orderId,
        prefill: {
          name: shippingAddress.fullName,
          email: user?.email,
          contact: shippingAddress.phone,
        },
        theme: { color: "#1a1a2e" },

        // Called automatically by Razorpay ONLY after a successful payment.
        // The 3 values here are what prove the payment is genuine once
        // we verify them server-side.
        handler: async (response) => {
          try {
            const { data: order } = await api.post("/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await fetchCart();
            navigate("/payment-success", { state: { order } });
          } catch (err) {
            setError(
              err.response?.data?.message || "Payment verification failed"
            );
            setSubmitting(false);
          }
        },

        // Called if the user closes the popup WITHOUT completing payment.
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            navigate("/payment-cancel");
          },
        },
      });

      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start checkout");
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Checkout</h2>

      {error && <Message variant="danger">{error}</Message>}

      <Row>
        <Col lg={7}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-3">Shipping Address</h5>
              <Form onSubmit={handleSubmit} id="checkout-form">
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Postal Code</Form.Label>
                      <Form.Control
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Order Summary</h5>
              <ListGroup variant="flush">
                {cart.items.map((item) => (
                  <ListGroup.Item
                    key={item._id}
                    className="d-flex justify-content-between px-0"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item className="d-flex justify-content-between px-0">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between px-0">
                  <span>Shipping</span>
                  <span>{shippingPrice === 0 ? "Free" : formatPrice(shippingPrice)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between px-0">
                  <span>Tax (5%)</span>
                  <span>{formatPrice(taxPrice)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between px-0 fw-bold fs-5">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </ListGroup.Item>
              </ListGroup>

              <div className="d-grid gap-2 mt-3">
                <Button
                  type="submit"
                  form="checkout-form"
                  name="paymentMethod"
                  value="COD"
                  variant="outline-dark"
                  disabled={submitting}
                >
                  {submitting && activeMethod === "COD"
                    ? "Placing order..."
                    : "Cash on Delivery"}
                </Button>
                <Button
                  type="submit"
                  form="checkout-form"
                  name="paymentMethod"
                  value="RAZORPAY"
                  variant="dark"
                  disabled={submitting}
                >
                  {submitting && activeMethod === "RAZORPAY"
                    ? "Opening payment window..."
                    : "Pay Now"}
                </Button>
              </div>
              <p className="text-muted small text-center mt-2 mb-0">
                Pay Now supports cards, UPI, netbanking &amp; wallets via Razorpay.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
