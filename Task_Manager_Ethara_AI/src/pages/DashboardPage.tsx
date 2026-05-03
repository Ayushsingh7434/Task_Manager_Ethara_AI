import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertCircle, BarChart3, FolderOpen, ListChecks, TrendingUp } from "lucide-react";
import { getTaskStats } from "../api/tasks";
import { getProjects } from "../api/projects";
import { useAuth } from "../context/AuthContext";

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

const statCards = (stats: Stats, projectCount: number) => [
  { label: "Total Tasks", value: stats.total, icon: ListChecks, gradient: "linear-gradient(135deg, #22c55e, #4ade80)", light: "#1a3a2a", text: "#4ade80" },
  { label: "Pending", value: stats.pending, icon: Clock, gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)", light: "#3a2a1a", text: "#fbbf24" },
  { label: "In Progress", value: stats.inProgress, icon: BarChart3, gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)", light: "#1a2a3a", text: "#60a5fa" },
  { label: "Completed", value: stats.completed, icon: CheckCircle2, gradient: "linear-gradient(135deg, #10b981, #34d399)", light: "#1a3a2a", text: "#34d399" },
  { label: "Overdue", value: stats.overdue, icon: AlertCircle, gradient: "linear-gradient(135deg, #ef4444, #f87171)", light: "#3a1a1a", text: "#f87171" },
  { label: "Projects", value: projectCount, icon: FolderOpen, gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)", light: "#2a1a3a", text: "#a78bfa" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([getTaskStats(), getProjects()]);
        setStats(statsRes.stats);
        setProjectCount(projectsRes.count || projectsRes.projects?.length || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const cards = statCards(stats, projectCount);

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#4ade80", margin: 0, letterSpacing: "-0.3px" }}>
          Welcome, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "#a3a3a3", margin: "4px 0 0", fontSize: "14px" }}>
          Here is your tasks overview for today.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} style={{
                background: "#1a1a1a", borderRadius: "16px", padding: "22px",
                height: "100px", animation: "pulse 1.5s infinite",
                boxShadow: "0 1px 8px rgba(0,0,0,0.3)"
              }} />
            ))
          : cards.map(({ label, value, icon: Icon, gradient }) => (
              <div key={label} style={{
                background: "#1a1a1a", borderRadius: "16px", padding: "20px 22px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.3)", border: "1px solid #2d2d2d",
                transition: "transform 0.15s, box-shadow 0.15s"
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(74,222,128,0.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)"; }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#767676", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {label}
                  </span>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: gradient, display: "flex", alignItems: "center",
                    justifyContent: "center", boxShadow: "0 3px 8px rgba(0,0,0,0.3)"
                  }}>
                    <Icon style={{ width: "18px", height: "18px", color: "white" }} />
                  </div>
                </div>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#4ade80", lineHeight: 1 }}>
                  {value}
                </div>
              </div>
            ))}
      </div>

      {/* Progress Card */}
      <div style={{
        background: "#1a1a1a", borderRadius: "16px", padding: "24px 26px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)", border: "1px solid #2d2d2d", marginBottom: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <TrendingUp style={{ width: "18px", height: "18px", color: "#4ade80" }} />
              <span style={{ fontWeight: 700, color: "#4ade80", fontSize: "15px" }}>Overall Progress</span>
            </div>
            <p style={{ fontSize: "13px", color: "#767676", margin: 0 }}>
              {stats.completed} / {stats.total} tasks completed
            </p>
          </div>
          <div style={{
            fontSize: "28px", fontWeight: 800, color: "#4ade80",
            background: "rgba(74,222,128,0.15)", padding: "6px 16px", borderRadius: "12px"
          }}>
            {completionRate}%
          </div>
        </div>
        <div style={{ background: "#2d2d2d", borderRadius: "999px", height: "12px", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "999px", transition: "width 0.8s ease",
            width: `${completionRate}%`,
            background: "linear-gradient(90deg, #22c55e, #4ade80, #86efac)"
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
          <span style={{ fontSize: "11px", color: "#767676" }}>0%</span>
          <span style={{ fontSize: "11px", color: "#767676" }}>50%</span>
          <span style={{ fontSize: "11px", color: "#767676" }}>100%</span>
        </div>
      </div>

      {/* Role Info */}
      <div style={{
        background: user?.role === "admin"
          ? "rgba(74,222,128,0.12)"
          : "rgba(74,222,128,0.08)",
        borderRadius: "14px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px",
        border: `1px solid rgba(74,222,128,0.3)`
      }}>
        <span style={{ fontSize: "22px" }}>{user?.role === "admin" ? "👑" : "👤"}</span>
        <div>
          <p style={{ fontWeight: 700, color: "#4ade80", margin: 0, fontSize: "14px" }}>
            You are logged in as <span style={{ textTransform: "capitalize" }}>{user?.role}</span>
          </p>
          <p style={{ fontSize: "12px", color: "#86efac", margin: "2px 0 0" }}>
            {user?.role === "admin"
              ? "You can create/delete projects, tasks and manage the team."
              : "You can view your assigned tasks and update their status."}
          </p>
        </div>
      </div>
    </div>
  );
}
