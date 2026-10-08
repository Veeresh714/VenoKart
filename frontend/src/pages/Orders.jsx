import { useState, useEffect } from "react";
import { Container, Table, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { formatPrice } from "../utils/formatPrice";

// Maps each order status to a Bootstrap color variant, so the badge
// color communicates meaning at a glance (yellow=pending, blue=processing...).
const statusColors = {
  Pending: "warning",
  Processing: "info",
  Shipped: "primary",
  Delivered: "success",
  Cancelled: "danger",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/api/orders/my-orders");
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Loader />;

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Orders</h2>

      {error && <Message variant="danger">{error}</Message>}

      {orders.length === 0 ? (
        <Message variant="info">
          You haven't placed any orders yet. <Link to="/">Start shopping</Link>
        </Message>
      ) : (
        <Table responsive hover className="bg-white shadow-sm align-middle">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                {/* Show a shortened ID - full Mongo IDs are 24 characters,
                    too long to be useful to a human reader. */}
                <td>#{order._id.slice(-8).toUpperCase()}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{formatPrice(order.totalPrice)}</td>
                <td>
                  {order.isPaid ? (
                    <Badge bg="success">Paid</Badge>
                  ) : (
                    <Badge bg="secondary">
                      {order.paymentMethod === "COD" ? "Pay on delivery" : "Not Paid"}
                    </Badge>
                  )}
                </td>
                <td>
                  <Badge bg={statusColors[order.status] || "secondary"}>
                    {order.status}
                  </Badge>
                </td>
                <td>
                  <Link to={`/orders/${order._id}`}>View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Orders;
