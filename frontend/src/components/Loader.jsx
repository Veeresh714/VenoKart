import { Spinner } from "react-bootstrap";

// A tiny, reusable component. Anytime we're waiting on an API call,
// we show this instead of duplicating the same spinner JSX everywhere.
const Loader = () => {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default Loader;
