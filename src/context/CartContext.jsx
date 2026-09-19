import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { useProducts } from "./ProductsContext";
import { createOrder } from "../api/orders";

const CART_STORAGE_KEY = "ecommerce_cart";
const LAST_ORDER_STORAGE_KEY = "ecommerce_last_order";

const CartContext = createContext(null);

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.items)) return { items: [] };
    return parsed;
  } catch {
    // Corrupt or unavailable storage shouldn't crash the app.
    return { items: [] };
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const { productId, quantity } = action.payload;
      const existing = state.items.find((item) => item.productId === productId);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return { items: [...state.items, { productId, quantity }] };
    }
    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.productId !== productId) };
      }
      return {
        items: state.items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      };
    }
    case "REMOVE_ITEM":
      return { items: state.items.filter((item) => item.productId !== action.payload.productId) };
    case "CLEAR_CART":
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const { getProductById } = useProducts();
  const [state, dispatch] = useReducer(reducer, undefined, loadCartFromStorage);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const items = useMemo(
    () =>
      state.items
        .map((item) => {
          const product = getProductById(item.productId);
          if (!product) return null; // product removed from catalog since it was added
          return { ...item, product };
        })
        .filter(Boolean),
    [state.items, getProductById]
  );

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  function addItem(productId, quantity = 1) {
    dispatch({ type: "ADD_ITEM", payload: { productId, quantity } });
  }

  function updateQuantity(productId, quantity) {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  }

  function removeItem(productId) {
    dispatch({ type: "REMOVE_ITEM", payload: { productId } });
  }

  function clearCart() {
    dispatch({ type: "CLEAR_CART" });
  }

  async function placeOrder({ name, email, address }) {
    const order = await createOrder({
      items: state.items.map(({ productId, quantity }) => ({ productId, quantity })),
      customer: { name, email, address },
    });
    localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify({ id: order.id }));
    clearCart();
    return order;
  }

  const value = {
    items,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    placeOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export function getLastOrder() {
  try {
    const raw = localStorage.getItem(LAST_ORDER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
