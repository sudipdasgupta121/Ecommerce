import { Link } from "react-router-dom";

export default function NotFoundPage({ message = "Page not found." }) {
  return (
    <div className="page" style={{ textAlign: "center", padding: "60px 0" }}>
      <h1>404</h1>
      <p>{message}</p>
      <Link to="/">Go back home</Link>
    </div>
  );
}
