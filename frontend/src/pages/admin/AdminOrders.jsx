import { useState, useEffect } from "react";
import { Container, Row, Col, Table, Badge, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { AdminSidebar } from "./AdminDashboard";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

const statusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusColors = {
  Pending: "warning",
  Processing: "info",
  Shipped: "primary",
  Delivered: "success",
  Cancelled: "danger",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Tracks which order row is currently saving a status change, so we
  // can disable just that row's dropdown during the request.
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/api/orders");
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const { data } = await api.put(`/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      // Update just that one order in local state, rather than
      // re-fetching the entire list from the server.
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: data.status } : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3} lg={2} className="px-0">
          <AdminSidebar />
        </Col>
        <Col md={9} lg={10} className="py-4">
          <h2 className="mb-4">Manage Orders</h2>

          {error && <Message variant="danger">{error}</Message>}

          {loading ? (
            <Loader />
          ) : orders.length === 0 ? (
            <Message variant="info">No orders yet.</Message>
          ) : (
            <Table responsive hover className="bg-white shadow-sm align-middle">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-8).toUpperCase()}</td>
                    <td>
                      {order.user?.name || "N/A"}
                      <div className="text-muted small">{order.user?.email}</div>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>${order.totalPrice.toFixed(2)}</td>
                    <td>
                      {order.isPaid ? (
                        <Badge bg="success">Paid</Badge>
                      ) : (
                        <Badge bg="secondary">Not Paid</Badge>
                      )}
                    </td>
                    <td style={{ minWidth: 150 }}>
                      <Form.Select
                        size="sm"
                        value={order.status}
                        disabled={updatingId === order._id}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`border-${statusColors[order.status]}`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Link to={`/orders/${order._id}`}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminOrders;
