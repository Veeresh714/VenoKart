import { useLocation, Link, Navigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import { FaCheckCircle, FaTruck } from "react-icons/fa";
import { formatPrice } from "../utils/formatPrice";

const PaymentSuccess = () => {
  // Checkout.jsx already created/verified the order and navigated here
  // with it attached as state - no extra API call needed, and (importantly)
  // no way for someone to land on this URL directly and see a fake
  // "success" page, since there's no order to display without real state.
  const location = useLocation();
  const order = location.state?.order;

  // If someone navigates here directly (e.g. refreshes the page, which
  // clears React Router state), we don't have an order to show. Rather
  // than displaying a broken/empty page, send them to their order
  // history, where the real, saved order will still be there.
  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  const isCOD = order.paymentMethod === "COD";

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card className="shadow-sm text-center p-4" style={{ maxWidth: 500 }}>
        <Card.Body>
          {isCOD ? (
            <FaTruck size={60} className="text-warning mb-3" />
          ) : (
            <FaCheckCircle size={60} className="text-success mb-3" />
          )}

          <h3>{isCOD ? "Order Placed Successfully!" : "Payment Successful!"}</h3>

          <p className="text-muted">
            {isCOD
              ? `Please keep ${formatPrice(order.totalPrice)} ready in cash - you'll pay when your order is delivered.`
              : "Thank you for your order. A confirmation has been recorded."}
          </p>

          {!isCOD && (
            <p className="fw-bold">Order Total: {formatPrice(order.totalPrice)}</p>
          )}

          <div className="d-flex gap-2 justify-content-center mt-4">
            <Button as={Link} to={`/orders/${order._id}`} variant="dark">
              View Order
            </Button>
            <Button as={Link} to="/" variant="outline-dark">
              Continue Shopping
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentSuccess;
