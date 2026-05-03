import { createContext, useState, useEffect, useContext } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUserState(JSON.parse(storedUser));
      setTokenState(storedToken);
    }
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  };

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  };

  const logout = () => {
    setUserState(null);
    setTokenState(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        setToken,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
