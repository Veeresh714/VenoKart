import { Card, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";
import { formatPrice } from "../utils/formatPrice";

// A "presentational" component: it just receives data via props and
// renders it. It has no idea WHERE the product data came from (Home page?
// Search results? Admin panel?) - that separation makes it reusable anywhere.
const ProductCard = ({ product }) => {
  const isOutOfStock = product.stock === 0;

  return (
    <Card className="h-100 shadow-sm product-card border-0">
      <Link to={`/products/${product._id}`}>
        <div className="product-img-wrapper">
          <Card.Img
            variant="top"
            src={getImageUrl(product.image)}
            alt={product.name}
            className="product-img"
          />
        </div>
      </Link>
      <Card.Body className="d-flex flex-column">
        <Badge bg="secondary" className="align-self-start mb-2">
          {product.category}
        </Badge>

        <Card.Title as="h6" className="mb-1">
          <Link to={`/products/${product._id}`} className="text-decoration-none text-dark">
            {product.name}
          </Link>
        </Card.Title>

        <Card.Text className="text-muted small flex-grow-1">
          {/* Truncate long descriptions so cards stay a uniform height */}
          {product.description.length > 70
            ? `${product.description.slice(0, 70)}...`
            : product.description}
        </Card.Text>

        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className="fw-bold fs-5">{formatPrice(product.price)}</span>
          {isOutOfStock ? (
            <Badge bg="danger">Out of Stock</Badge>
          ) : (
            <Badge bg="success">In Stock</Badge>
          )}
        </div>

        <Button
          as={Link}
          to={`/products/${product._id}`}
          variant="dark"
          size="sm"
          className="mt-3"
        >
          View Details
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
