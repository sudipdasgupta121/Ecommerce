import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../api/products";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const getProductById = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return (id) => byId.get(id);
  }, [products]);

  const value = { products, loading, error, getProductById };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within a ProductsProvider");
  return ctx;
}
