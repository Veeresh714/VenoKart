import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { FaBox, FaShoppingBag, FaDollarSign, FaUsers, FaCheck, FaCheckCircle, FaGem } from "react-icons/fa";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { formatPrice } from "../../utils/formatPrice";

// Reusable sidebar shared across all admin pages. Defined here and
// exported so AdminProducts/AdminOrders/etc. can import and reuse it,
// keeping the admin layout consistent everywhere.
export const AdminSidebar = () => {
  const location = useLocation();

  const links = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/orders", label: "Orders" },
  ];

  return (
    <Nav className="flex-column p-3 admin-sidebar">
      {links.map((link) => (
        <Nav.Link
          key={link.to}
          as={Link}
          to={link.to}
          className={location.pathname.startsWith(link.to) ? "active" : ""}
        >
          {link.label}
        </Nav.Link>
      ))}
    </Nav>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <Card className="shadow-sm border-0 h-100">
    <Card.Body className="d-flex align-items-center gap-3">
      <div
        className={`rounded-circle d-flex align-items-center justify-content-center bg-${color} bg-opacity-10 text-${color}`}
        style={{ width: 56, height: 56, fontSize: 24 }}
      >
        {icon}
      </div>
      <div>
        <div className="text-muted small">{label}</div>
        <div className="fs-4 fw-bold">{value}</div>
      </div>
    </Card.Body>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // There's no single "stats" endpoint on our backend (keeping the API
    // surface minimal for this learning project), so we derive summary
    // numbers on the frontend from the products and orders lists we
    // already have controllers for. In a larger app, you'd add a
    // dedicated GET /api/admin/stats endpoint that aggregates in MongoDB.
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          api.get("/api/products?limit=1000"),
          api.get("/api/orders"),
        ]);

        const orders = ordersRes.data;
        const totalRevenue = orders
          .filter((o) => o.isPaid)
          .reduce((sum, o) => sum + o.totalPrice, 0);

        setStats({
          productCount: productsRes.data.total,
          orderCount: orders.length,
          revenue: totalRevenue,
          pendingOrders: orders.filter((o) => o.status === "Pending" || o.status === "Processing").length,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Container fluid>
      <Row>
        <Col md={3} lg={2} className="px-0">
          <AdminSidebar />
        </Col>
        <Col md={9} lg={10} className="py-4">
          <h2 className="mb-4">Admin Dashboard</h2>

          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <Row className="g-4">
              <Col sm={6} lg={3}>
                <StatCard
                  icon={<FaBox />}
                  label="Total Products"
                  value={stats.productCount}
                  color="primary"
                />
              </Col>
              <Col sm={6} lg={3}>
                <StatCard
                  icon={<FaShoppingBag />}
                  label="Total Orders"
                  value={stats.orderCount}
                  color="success"
                />
              </Col>
              <Col sm={6} lg={3}>
                <StatCard
                  icon={<FaGem />}
                  label="Revenue"
                  value={formatPrice(stats.revenue)}
                  color="warning"
                />
              </Col>
              <Col sm={6} lg={3}>
                <StatCard
                  icon={<FaUsers />}
                  label="Orders Needing Attention"
                  value={stats.pendingOrders}
                  color="danger"
                />
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
