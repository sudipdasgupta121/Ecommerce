import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/currency";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;

  return (
    <div className={styles.card}>
      <Link to={`/product/${product.id}`} className={styles.imageLink}>
        <img src={product.image} alt={product.name} className={styles.image} />
      </Link>
      <div className={styles.body}>
        <span className={styles.category}>{product.category}</span>
        <Link to={`/product/${product.id}`} className={styles.name}>
          {product.name}
        </Link>
        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          <button
            type="button"
            className={styles.addButton}
            disabled={outOfStock}
            onClick={() => addItem(product.id, 1)}
          >
            {outOfStock ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
