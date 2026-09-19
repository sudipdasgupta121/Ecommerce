import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/currency";
import styles from "./CheckoutPage.module.css";

export default function CheckoutPage() {
  const { items, subtotal, placeOrder } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", address: "" });

  // Prefill from the logged-in session once available; fields stay editable.
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);
  const [errors, setErrors] = useState({});
  // placeOrder() clears the cart, which would otherwise make this component's
  // own "empty cart" guard fire before the navigate to the confirmation page lands.
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  if (items.length === 0 && !orderPlaced) {
    return <Navigate to="/cart" replace />;
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.address.trim()) nextErrors.address = "Shipping address is required.";
    return nextErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    setSubmitting(true);
    try {
      const order = await placeOrder(form);
      setOrderPlaced(true);
      navigate("/order-confirmation", { state: { orderId: order.id } });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1 className={styles.title}>Checkout</h1>
      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <p className={styles.note}>
            This is a demo checkout — no payment is collected, but the order is saved.
          </p>
          <div className={styles.field}>
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="address">Shipping address</label>
            <textarea
              id="address"
              rows={3}
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
            {errors.address && <span className={styles.error}>{errors.address}</span>}
          </div>
          {submitError && <p className={styles.error}>{submitError}</p>}
          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? "Placing order..." : "Place order"}
          </button>
        </form>

        <div className={styles.summary}>
          {items.map(({ product, quantity }) => (
            <div className={styles.summaryItem} key={product.id}>
              <span>
                {product.name} × {quantity}
              </span>
              <span>{formatPrice(product.price * quantity)}</span>
            </div>
          ))}
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
