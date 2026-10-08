import { Link } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import { FaTimesCircle } from "react-icons/fa";

const PaymentCancel = () => {
  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card className="shadow-sm text-center p-4" style={{ maxWidth: 500 }}>
        <Card.Body>
          <FaTimesCircle size={60} className="text-danger mb-3" />
          <h3>Payment Cancelled</h3>
          <p className="text-muted">
            Your payment was not completed. Your cart items are still saved,
            so you can try again anytime.
          </p>
          <div className="d-flex gap-2 justify-content-center mt-4">
            <Button as={Link} to="/cart" variant="dark">
              Return to Cart
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

export default PaymentCancel;
