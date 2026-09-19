import { useMemo, useState } from "react";
import { CATEGORIES } from "../data/products";
import { useProducts } from "../context/ProductsContext";
import ProductCard from "../components/ProductCard";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const { products, loading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  return (
    <div className="page">
      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.search}
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
        <select
          className={styles.categorySelect}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className={styles.empty}>Loading products...</p>
      ) : error ? (
        <p className={styles.empty}>Couldn't load products: {error}</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>No products match your search.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
