import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AdminSidebar } from "./AdminDashboard";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { getImageUrl } from "../../utils/getImageUrl";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  brand: "",
  stock: "",
};

const AdminProductForm = () => {
  const { id } = useParams(); // present only when editing an existing product
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null); // the actual File object to upload
  const [imagePreview, setImagePreview] = useState(""); // for displaying a preview
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // In edit mode, load the existing product's data to pre-fill the form.
  useEffect(() => {
    if (!isEditMode) return;

    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setForm({
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          brand: data.brand,
          stock: data.stock,
        });
        setImagePreview(getImageUrl(data.image));
      } catch (err) {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // URL.createObjectURL builds a temporary local URL pointing at the
      // file on the user's own machine, letting us preview it instantly
      // WITHOUT uploading it first.
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Build a FormData object (not a plain JS object!) since we're
      // sending a file alongside text fields - this is what multer
      // on the backend expects to parse.
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (imageFile) {
        formData.append("image", imageFile); // field name MUST match
        // upload.single("image") in uploadMiddleware.js on the backend
      }

      if (isEditMode) {
        await api.put(`/api/products/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3} lg={2} className="px-0">
          <AdminSidebar />
        </Col>
        <Col md={9} lg={10} className="py-4">
          <h2 className="mb-4">{isEditMode ? "Edit Product" : "Add New Product"}</h2>

          {error && <Message variant="danger">{error}</Message>}

          {loading ? (
            <Loader />
          ) : (
            <Card className="shadow-sm p-4" style={{ maxWidth: 700 }}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price (₹)</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          name="price"
                          value={form.price}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Stock Quantity</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          name="stock"
                          value={form.stock}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Brand</Form.Label>
                        <Form.Control
                          name="brand"
                          value={form.brand}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>Product Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mt-3 rounded border"
                        style={{ width: 120, height: 120, objectFit: "cover" }}
                      />
                    )}
                  </Form.Group>

                  <Button type="submit" variant="dark" disabled={submitting}>
                    {submitting
                      ? "Saving..."
                      : isEditMode
                      ? "Update Product"
                      : "Create Product"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminProductForm;
