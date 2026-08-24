import { Alert } from "react-bootstrap";

// A reusable alert box for showing errors/success/info messages
// consistently across the whole app. "variant" controls the color
// (danger = red, success = green, info = blue, etc - Bootstrap's naming).
const Message = ({ variant = "info", children }) => {
  return <Alert variant={variant}>{children}</Alert>;
};

export default Message;
