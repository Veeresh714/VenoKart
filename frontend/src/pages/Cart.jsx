import { useState } from "react";
import { Container, Row, Col, Table, Button, Form, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { getImageUrl } from "../utils/getImageUrl";
import { formatPrice } from "../utils/formatPrice";

const Cart = () => {
  const { cart, loading, subtotal, updateCartItem, removeCartItem } = useCart();
  const navigate = useNavigate();
  // Tracks which specific item is currently being updated, so we can
  // disable just THAT row's controls instead of freezing the whole page.
  const [updatingId, setUpdatingId] = useState(null);

  const handleQuantityChange = async (itemId, quantity) => {
    setUpdatingId(itemId);
    try {
      await updateCartItem(itemId, quantity);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    setUpdatingId(itemId);
    try {
      await removeCartItem(itemId);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Shopping Cart</h2>

      {cart.items.length === 0 ? (
        <Message variant="info">
          Your cart is empty. <Link to="/">Go shopping</Link>
        </Message>
      ) : (
        <Row>
          <Col lg={8}>
            <Table responsive hover className="align-middle bg-white shadow-sm">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          style={{ width: 60, height: 60, objectFit: "cover" }}
                          className="rounded"
                        />
                        <Link
                          to={`/products/${item.product}`}
                          className="text-decoration-none text-dark"
                        >
                          {item.name}
                        </Link>
                      </div>
                    </td>
                    <td>{formatPrice(item.price)}</td>
                    <td style={{ maxWidth: 90 }}>
                      <Form.Control
                        type="number"
                        min={1}
                        value={item.quantity}
                        disabled={updatingId === item._id}
                        onChange={(e) =>
                          handleQuantityChange(item._id, Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="fw-bold">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={updatingId === item._id}
                        onClick={() => handleRemove(item._id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Order Summary</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span>
                    Subtotal (
                    {cart.items.reduce((sum, i) => sum + i.quantity, 0)} items)
                  </span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <p className="text-muted small">
                  Shipping and tax calculated at checkout.
                </p>
                <Button
                  variant="dark"
                  className="w-100 mt-2"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Cart;
