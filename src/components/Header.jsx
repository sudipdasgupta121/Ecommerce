import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import styles from "./Header.module.css";

export default function Header() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          Shopfront
        </Link>
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>
            Home
          </Link>
          <Link to="/cart" className={`${styles.navLink} ${styles.cartLink}`}>
            Cart
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </Link>
          {user ? (
            <>
              <span className={styles.navLink}>{user.name || user.email}</span>
              <button type="button" className={styles.navButton} onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>
                Log in
              </Link>
              <Link to="/signup" className={styles.navLink}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
