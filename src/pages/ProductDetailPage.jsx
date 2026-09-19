import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/currency";
import QuantityStepper from "../components/QuantityStepper";
import NotFoundPage from "./NotFoundPage";
import styles from "./ProductDetailPage.module.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { getProductById, loading } = useProducts();
  const product = getProductById(id);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (loading) {
    return <p className="page">Loading product...</p>;
  }

  if (!product) {
    return <NotFoundPage message="We couldn't find that product." />;
  }

  const outOfStock = product.stock <= 0;

  function handleAddToCart() {
    addItem(product.id, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="page">
      <Link to="/" className={styles.back}>
        ← Back to products
      </Link>
      <div className={styles.layout}>
        <div className={styles.imageWrap}>
          <img src={product.image} alt={product.name} className={styles.image} />
        </div>
        <div>
          <span className={styles.category}>{product.category}</span>
          <h1 className={styles.name}>{product.name}</h1>
          <div className={styles.price}>{formatPrice(product.price)}</div>
          <p className={styles.description}>{product.description}</p>
          <p className={styles.stock}>
            {outOfStock ? (
              <span className={styles.outOfStock}>Out of stock</span>
            ) : (
              <span className={styles.inStock}>{product.stock} in stock</span>
            )}
          </p>
          <div className={styles.actions}>
            <QuantityStepper quantity={quantity} onChange={setQuantity} max={product.stock || 1} />
            <button
              type="button"
              className={styles.addButton}
              disabled={outOfStock}
              onClick={handleAddToCart}
            >
              Add to cart
            </button>
          </div>
          {justAdded && <p className={styles.confirmation}>Added to cart ✓</p>}
        </div>
      </div>
    </div>
  );
}
