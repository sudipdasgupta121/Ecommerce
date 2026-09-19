import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/currency";
import QuantityStepper from "../components/QuantityStepper";
import styles from "./CartPage.module.css";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="page">
        <h1 className={styles.title}>Your Cart</h1>
        <p className={styles.empty}>
          Your cart is empty. <Link to="/">Continue shopping</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className={styles.title}>Your Cart</h1>
      <div className={styles.layout}>
        <div className={styles.list}>
          {items.map(({ product, quantity }) => (
            <div className={styles.item} key={product.id}>
              <img src={product.image} alt={product.name} className={styles.itemImage} />
              <div className={styles.itemInfo}>
                <Link to={`/product/${product.id}`} className={styles.itemName}>
                  {product.name}
                </Link>
                <div className={styles.itemPrice}>{formatPrice(product.price)} each</div>
              </div>
              <div className={styles.itemControls}>
                <span className={styles.lineTotal}>{formatPrice(product.price * quantity)}</span>
                <QuantityStepper
                  quantity={quantity}
                  onChange={(q) => updateQuantity(product.id, q)}
                  max={product.stock || 99}
                />
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeItem(product.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link to="/checkout" className={styles.checkoutButton}>
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
