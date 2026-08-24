import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, ListGroup, Badge } from "react-bootstrap";
import api from "../api/axios";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { getImageUrl } from "../utils/getImageUrl";
import { formatPrice } from "../utils/formatPrice";

const statusColors = {
  Pending: "warning",
  Processing: "info",
  Shipped: "primary",
  Delivered: "success",
  Cancelled: "danger",
};

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <Loader />;
  if (error)
    return (
      <Container className="py-5">
        <Message variant="danger">{error}</Message>
      </Container>
    );
  if (!order) return null;

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        Order #{order._id.slice(-8).toUpperCase()}{" "}
        <Badge bg={statusColors[order.status] || "secondary"} className="fs-6 align-middle">
          {order.status}
        </Badge>
      </h2>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5>Shipping Address</h5>
              <p className="mb-1">{order.shippingAddress.fullName}</p>
              <p className="mb-1">{order.shippingAddress.street}</p>
              <p className="mb-1">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="mb-1">{order.shippingAddress.country}</p>
              <p className="mb-0">Phone: {order.shippingAddress.phone}</p>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Items</h5>
              <ListGroup variant="flush">
                {order.orderItems.map((item, idx) => (
                  <ListGroup.Item key={idx}>
                    <Row className="align-items-center">
                      <Col xs={2} md={1}>
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="img-fluid rounded"
                        />
                      </Col>
                      <Col>{item.name}</Col>
                      <Col className="text-end">
                        {item.quantity} × {formatPrice(item.price)} ={" "}
                        {formatPrice(item.quantity * item.price)}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Order Summary</h5>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between px-0">
                  <span>Items</span>
                  <span>{formatPrice(order.itemsPrice)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between px-0">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shippingPrice)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between px-0">
                  <span>Tax</span>
                  <span>{formatPrice(order.taxPrice)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between px-0 fw-bold fs-5">
                  <span>Total</span>
                  <span>{formatPrice(order.totalPrice)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="px-0">
                  Payment Method: <strong>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay"}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="px-0">
                  Payment Status:{" "}
                  {order.isPaid ? (
                    <Badge bg="success">
                      Paid on {new Date(order.paidAt).toLocaleDateString()}
                    </Badge>
                  ) : (
                    <Badge bg="secondary">
                      {order.paymentMethod === "COD" ? "Pay on delivery" : "Not Paid"}
                    </Badge>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetails;
