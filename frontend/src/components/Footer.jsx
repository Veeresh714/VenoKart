import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container className="text-center">
        <p className="mb-1">⚡🛒 VenoKart &mdash; Buit with MERN Stack</p>
        <small className="text-secondary">
          Veeresh_Shegaji &copy; {new Date().getFullYear()}
        </small>
      </Container>
    </footer>
  );
};

export default Footer;
