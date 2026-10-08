import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container className="text-center">
        <p className="mb-1">🛒🛍️ VenoKart &mdash; Shop with Ease</p>
        <small className="text-secondary">
          Built with Mern Stack and by Veeresh Shegaji &copy; {new Date().getFullYear()}
        </small>
      </Container>
    </footer>
  );
};

export default Footer;
