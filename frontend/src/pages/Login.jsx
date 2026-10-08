import { useState } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Message from "../components/Message";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If PrivateRoute redirected the user here, it stored where they were
  // TRYING to go in location.state.from. Fall back to home ("/") otherwise.
  const redirectTo = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser's default full-page form submit
    setError("");
    setSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      navigate(redirectTo, { replace: true });
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  return (
    <Container>
      <Card className="auth-card shadow-sm p-4">
        <Card.Body>
          <h3 className="text-center mb-4">Welcome Back</h3>

          {error && <Message variant="danger">{error}</Message>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              type="submit"
              variant="dark"
              className="w-100"
              disabled={submitting}
            >
              {submitting ? "Logging in..." : "Login"}
            </Button>
          </Form>

          <p className="text-center mt-4 mb-0">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
