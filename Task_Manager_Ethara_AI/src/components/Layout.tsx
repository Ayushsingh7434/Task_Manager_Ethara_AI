import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "#818cf8" },
  { to: "/projects", label: "Projects", icon: FolderKanban, color: "#34d399" },
  { to: "/tasks", label: "Tasks", icon: CheckSquare, color: "#f59e0b" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#111111", fontFamily: "system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: "220px", display: "flex", flexDirection: "column", flexShrink: 0,
        background: "#0f0f0f",
        boxShadow: "4px 0 20px rgba(0,0,0,0.5)"
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #22c55e, #4ade80)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 10px rgba(34,197,94,0.4)"
            }}>
              <CheckSquare style={{ width: "18px", height: "18px", color: "white" }} />
            </div>
            <div>
              <span style={{ color: "white", fontWeight: 800, fontSize: "17px", letterSpacing: "-0.3px" }}>TaskFlow</span>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", letterSpacing: "1px", textTransform: "uppercase" }}>Manager</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", textTransform: "uppercase", padding: "0 10px", marginBottom: "8px" }}>
            Menu
          </div>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "10px", marginBottom: "3px",
                textDecoration: "none", transition: "all 0.15s",
                background: isActive ? "rgba(74,222,128,0.15)" : "transparent",
                color: isActive ? "#4ade80" : "rgba(255,255,255,0.45)",
                fontWeight: isActive ? 600 : 500, fontSize: "14px",
                borderLeft: isActive ? `3px solid #4ade80` : "3px solid transparent"
              })}>
              {({ isActive }) => (
                <>
                  <Icon style={{ width: "16px", height: "16px", color: isActive ? "#4ade80" : "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 12px", borderRadius: "10px",
            background: "rgba(74,222,128,0.08)", marginBottom: "6px"
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #22c55e, #4ade80)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, color: "white"
            }}>
              {user?.name?.[0]?.toUpperCase() || <User style={{ width: "14px", height: "14px" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "white", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name}
              </div>
              <div style={{
                fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px",
                color: user?.role === "admin" ? "#4ade80" : "#4ade80"
              }}>
                {user?.role}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: "8px", width: "100%",
            padding: "9px 12px", borderRadius: "10px", border: "none",
            background: "transparent", color: "rgba(255,255,255,0.35)",
            fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s"
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = "#ff6b6b"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)"; }}>
            <LogOut style={{ width: "14px", height: "14px" }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
