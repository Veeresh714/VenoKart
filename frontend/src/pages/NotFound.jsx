import { Link } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <h1 className="display-1 fw-bold">404</h1>
      <p className="fs-4 mb-4">Oops! The page you're looking for doesn't exist.</p>
      <Button as={Link} to="/" variant="dark">
        Go Back Home
      </Button>
    </Container>
  );
};

export default NotFound;
