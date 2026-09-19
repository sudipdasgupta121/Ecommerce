import { Link, Navigate, useLocation } from "react-router-dom";
import { getLastOrder } from "../context/CartContext";
import styles from "./OrderConfirmationPage.module.css";

export default function OrderConfirmationPage() {
  const location = useLocation();
  const lastOrder = getLastOrder();
  const orderId = location.state?.orderId ?? lastOrder?.id;

  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page">
      <div className={styles.wrap}>
        <div className={styles.icon}>✅</div>
        <h1 className={styles.title}>Thank you for your order!</h1>
        <p className={styles.orderId}>Order ID: {orderId}</p>
        <p className={styles.note}>
          This is a demo order confirmation — no real order was processed and no email was sent.
        </p>
        <Link to="/" className={styles.homeLink}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
