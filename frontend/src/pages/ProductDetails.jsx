import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Badge, Button, Form } from "react-bootstrap";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { getImageUrl } from "../utils/getImageUrl";
import { formatPrice } from "../utils/formatPrice";

const ProductDetails = () => {
  // useParams reads dynamic segments from the URL - since our route is
  // "/products/:id", useParams() gives us { id: "the-actual-mongo-id" }.
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || "Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    // Re-run this effect if the :id in the URL changes (e.g. user
    // navigates from one product detail page directly to another).
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      // Preserve intent: send them to login, and PrivateRoute-style flows
      // could bring them back here after - keeping it simple for now.
      navigate("/login");
      return;
    }

    setAdding(true);
    setMessage({ type: "", text: "" });
    try {
      await addToCart(product._id, quantity);
      setMessage({ type: "success", text: "Added to cart!" });
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.response?.data?.message || "Failed to add to cart",
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <Container className="py-5">
        <Message variant="danger">{error}</Message>
      </Container>
    );
  if (!product) return null;

  return (
    <Container className="py-5">
      <Row className="g-5">
        <Col md={5}>
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="img-fluid rounded shadow-sm"
          />
        </Col>

        <Col md={7}>
          <Badge bg="secondary" className="mb-2">
            {product.category}
          </Badge>
          <h2>{product.name}</h2>
          <p className="text-muted">Brand: {product.brand}</p>

          <h3 className="text-primary my-3">{formatPrice(product.price)}</h3>

          <p>{product.description}</p>

          <p>
            Availability:{" "}
            {product.stock > 0 ? (
              <span className="text-success fw-bold">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-danger fw-bold">Out of Stock</span>
            )}
          </p>

          {message.text && <Message variant={message.type}>{message.text}</Message>}

          {product.stock > 0 && (
            <Row className="align-items-center mt-4 g-2">
              <Col xs="auto">
                <Form.Select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  style={{ width: "90px" }}
                >
                  {/* Offer a dropdown from 1 up to available stock (max 10
                      shown, to keep the dropdown short even for huge stock). */}
                  {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs="auto">
                <Button
                  variant="dark"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={adding}
                >
                  {adding ? "Adding..." : "Add to Cart"}
                </Button>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails;
