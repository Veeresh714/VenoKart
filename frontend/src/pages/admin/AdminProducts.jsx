import { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import api from "../../api/axios";
import { AdminSidebar } from "./AdminDashboard";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { getImageUrl } from "../../utils/getImageUrl";
import { formatPrice } from "../../utils/formatPrice";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Tracks which product is mid-delete, so we can disable just that row's
  // button and avoid double-clicks triggering duplicate delete requests.
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/products?limit=1000");
      setProducts(data.products);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    // A native browser confirm dialog - simple and effective guard
    // against accidental destructive actions. Good enough for this project;
    // a polished app might use a custom modal instead.
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      await api.delete(`/api/products/${id}`);
      // Remove it from local state immediately instead of re-fetching
      // the whole list - faster UI feedback.
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3} lg={2} className="px-0">
          <AdminSidebar />
        </Col>
        <Col md={9} lg={10} className="py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Manage Products</h2>
            <Button as={Link} to="/admin/products/new" variant="dark">
              <FaPlus className="me-2" />
              Add Product
            </Button>
          </div>

          {error && <Message variant="danger">{error}</Message>}

          {loading ? (
            <Loader />
          ) : (
            <Table responsive hover className="bg-white shadow-sm align-middle">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        style={{ width: 48, height: 48, objectFit: "cover" }}
                        className="rounded"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>
                      <Badge bg="secondary">{product.category}</Badge>
                    </td>
                    <td>{formatPrice(product.price)}</td>
                    <td>
                      {product.stock === 0 ? (
                        <Badge bg="danger">Out of stock</Badge>
                      ) : (
                        product.stock
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          as={Link}
                          to={`/admin/products/${product._id}/edit`}
                          size="sm"
                          variant="outline-primary"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          disabled={deletingId === product._id}
                          onClick={() => handleDelete(product._id, product.name)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
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

export default AdminProducts;
