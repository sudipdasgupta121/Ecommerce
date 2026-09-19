import styles from "./QuantityStepper.module.css";

export default function QuantityStepper({ quantity, onChange, min = 1, max = 99 }) {
  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={styles.value}>{quantity}</span>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
