import { useState, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Message from "../components/Message";
import Loader from "../components/Loader";

const Profile = () => {
  const { updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    password: "",
  });

  // Fetch the full, current profile from the server on mount - the user
  // object stored in AuthContext only has basic fields from login/register.
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/api/auth/profile");
        setProfile(data);
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          postalCode: data.address?.postalCode || "",
          country: data.address?.country || "",
          password: "",
        });
      } catch (err) {
        setMessage({ type: "danger", text: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
      };
      // Only include password in the update if the user actually typed
      // a new one - we don't want to accidentally send an empty password.
      if (form.password) {
        payload.password = form.password;
      }

      const updated = await updateProfile(payload);
      setProfile(updated);
      setForm((prev) => ({ ...prev, password: "" }));
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm p-4">
            <Card.Body>
              <h3 className="mb-4">My Profile</h3>

              {message.text && <Message variant={message.type}>{message.text}</Message>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  {/* Email is intentionally read-only - changing it would
                      require re-verification in a real app, out of scope here. */}
                  <Form.Control type="email" value={profile.email} disabled />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control name="name" value={form.name} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control name="phone" value={form.phone} onChange={handleChange} />
                </Form.Group>

                <hr />
                <h6 className="mb-3">Default Shipping Address</h6>

                <Form.Group className="mb-3">
                  <Form.Label>Street</Form.Label>
                  <Form.Control name="street" value={form.street} onChange={handleChange} />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control name="city" value={form.city} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control name="state" value={form.state} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Postal Code</Form.Label>
                      <Form.Control
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Control name="country" value={form.country} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>

                <hr />

                <Form.Group className="mb-4">
                  <Form.Label>New Password (leave blank to keep current)</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </Form.Group>

                <Button type="submit" variant="dark" className="w-100" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
