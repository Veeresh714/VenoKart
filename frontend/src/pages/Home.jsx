import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Row, Col, Form, Pagination } from "react-bootstrap";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import Message from "../components/Message";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pages, setPages] = useState(1);

  // useSearchParams reads/writes the URL's query string (e.g. ?keyword=shoe).
  // We use it as our "source of truth" for filters instead of separate
  // useState variables, so filters survive refresh and are shareable via URL.
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "All";
  const page = searchParams.get("page") || "1";

  // Fetch the list of categories once when the page first mounts.
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/api/products/categories");
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Re-fetch products every time keyword, category, or page changes.
  // This is the core data-fetching pattern in React: useEffect with a
  // dependency array that tells React WHEN to re-run this side effect.
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (keyword) params.set("keyword", keyword);
        if (category && category !== "All") params.set("category", category);
        params.set("page", page);

        const { data } = await api.get(`/api/products?${params.toString()}`);
        setProducts(data.products);
        setPages(data.pages);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, category, page]);

  const handleCategoryChange = (e) => {
    // setSearchParams updates the URL, which triggers the useEffect above
    // automatically (since "category" derives from the URL). We reset
    // page back to 1 whenever the filter changes, since page 5 of a new
    // filter might not exist.
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (e.target.value === "All") {
        next.delete("category");
      } else {
        next.set("category", e.target.value);
      }
      next.set("page", "1");
      return next;
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", newPage.toString());
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <h2 className="mb-0">
          {keyword ? `Search results for "${keyword}"` : "All Products"}
        </h2>

        <Form.Select
          style={{ maxWidth: "220px" }}
          value={category}
          onChange={handleCategoryChange}
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Form.Select>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : products.length === 0 ? (
        <Message variant="info">No products found.</Message>
      ) : (
        <>
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {products.map((product) => (
              <Col key={product._id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          {pages > 1 && (
            <Pagination className="justify-content-center mt-5">
              {[...Array(pages).keys()].map((x) => (
                <Pagination.Item
                  key={x + 1}
                  active={x + 1 === Number(page)}
                  onClick={() => handlePageChange(x + 1)}
                >
                  {x + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default Home;
