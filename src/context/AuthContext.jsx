import { createContext, useContext } from "react";
import { authClient } from "../lib/authClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data, isPending } = authClient.useSession();

  async function login({ email, password }) {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message || "Failed to log in.");
  }

  async function signup({ name, email, password }) {
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) throw new Error(error.message || "Failed to sign up.");
  }

  async function logout() {
    await authClient.signOut();
  }

  const value = { user: data?.user ?? null, isPending, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
