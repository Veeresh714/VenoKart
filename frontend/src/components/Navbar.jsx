import { useState } from "react";
import { Navbar as BsNavbar, Nav, Container, Form, FormControl, Badge, NavDropdown } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { FaShoppingCart, FaUser, FaSun, FaMoon } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Called when the search form is submitted. We navigate to the Home
  // page with a "?keyword=" query string, which Home.jsx reads to
  // filter products - this keeps search state IN THE URL (shareable,
  // bookmarkable, and survives page refresh) rather than only in React state.
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?keyword=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm py-3">
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="fw-bold fs-4">
          ⚡🛒 VenoKart
        </BsNavbar.Brand>

        {/* This button only appears on small screens and toggles the
            collapsed menu below - standard responsive Bootstrap navbar pattern. */}
        <BsNavbar.Toggle aria-controls="main-navbar" />

        <BsNavbar.Collapse id="main-navbar">
          <Form className="d-flex mx-auto my-2 my-lg-0 w-50" onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search"
            />
          </Form>

          <Nav className="ms-auto align-items-lg-center gap-lg-2">
            {/* A plain button, not a Nav.Link, since it performs an action
                (toggle) rather than navigating anywhere. aria-label makes
                it accessible to screen readers since it has no visible text. */}
            <button
              type="button"
              className="btn btn-outline-light btn-sm rounded-circle me-lg-2 my-2 my-lg-0"
              style={{ width: 38, height: 38 }}
              onClick={toggleTheme}
              aria-label="Toggle light/dark theme"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>

            <Nav.Link as={Link} to="/cart" className="position-relative">
              <FaShoppingCart className="me-1" /> Cart
              {itemCount > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  {itemCount}
                </Badge>
              )}
            </Nav.Link>

            {isAuthenticated ? (
              <NavDropdown
                title={
                  <span>
                    <FaUser className="me-1" /> {user.name}
                  </span>
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/orders">
                  My Orders
                </NavDropdown.Item>
                {isAdmin && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/admin/dashboard">
                      Admin Dashboard
                    </NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
