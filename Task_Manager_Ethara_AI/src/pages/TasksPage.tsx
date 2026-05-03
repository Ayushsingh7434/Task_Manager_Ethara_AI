import { useEffect, useState } from "react";
import { Plus, Loader2, CheckSquare, Clock, AlertCircle, Search } from "lucide-react";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";
import { getProjects, getAllUsers } from "../api/projects";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const STATUS_OPTIONS = ["pending", "in_progress", "completed"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

const priorityConfig: Record<string, { bg: string; color: string; dot: string }> = {
  high: { bg: "#3a1a1a", color: "#ff6b6b", dot: "#ff5252" },
  medium: { bg: "#3a2a1a", color: "#ffa500", dot: "#ff8c00" },
  low: { bg: "#1a2a1a", color: "#4ade80", dot: "#22c55e" },
};

export default function TasksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "", description: "", projectId: "", assignedTo: "", priority: "medium", deadline: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      const res = await getTasks(params);
      setTasks(res.tasks || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus, filterPriority]);

  useEffect(() => {
    getProjects().then((r) => setProjects(r.projects || [])).catch(console.error);
    if (isAdmin) getAllUsers().then((r) => setAllUsers(r.users || [])).catch(console.error);
  }, [isAdmin]);

  const handleCreate = async () => {
    if (!createForm.title.trim() || !createForm.projectId) return setCreateError("Title and project are required.");
    setCreating(true); setCreateError("");
    try {
      await createTask({ ...createForm, assignedTo: createForm.assignedTo || undefined, deadline: createForm.deadline || undefined });
      setCreateForm({ title: "", description: "", projectId: "", assignedTo: "", priority: "medium", deadline: "" });
      setShowCreate(false);
      load();
    } catch (e: any) {
      setCreateError(e?.response?.data?.message || "Error creating task.");
    } finally { setCreating(false); }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    setUpdatingId(taskId);
    try { await updateTask(taskId, { status }); load(); }
    catch (e) { console.error(e); }
    finally { setUpdatingId(""); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    try { await deleteTask(id); load(); } catch (e) { console.error(e); }
  };

  const filtered = tasks.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
  });

  const selectStyle: React.CSSProperties = {
    padding: "9px 12px", border: "1.5px solid #3a3a3a", borderRadius: "10px",
    fontSize: "13px", outline: "none", background: "#1a1a1a", fontFamily: "inherit", color: "#e4e4e7"
  };

  const formInputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 13px", border: "1.5px solid #3a3a3a",
    borderRadius: "10px", fontSize: "14px", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", color: "#e4e4e7", background: "#1a1a1a"
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#4ade80", margin: 0, letterSpacing: "-0.3px" }}>Tasks</h1>
          <p style={{ color: "#767676", margin: "3px 0 0", fontSize: "13px" }}>
            {filtered.length} task{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} style={{
            display: "flex", alignItems: "center", gap: "7px",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "white", border: "none", borderRadius: "12px",
            padding: "10px 18px", fontSize: "14px", fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 12px rgba(34,197,94,0.35)"
          }}>
            <Plus style={{ width: "16px", height: "16px" }} /> New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: "#767676" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..."
            style={{ ...selectStyle, paddingLeft: "36px", width: "100%", boxSizing: "border-box" }} />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={selectStyle}>
          <option value="">All Priority</option>
          {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {(filterStatus || filterPriority || search) && (
          <button onClick={() => { setFilterStatus(""); setFilterPriority(""); setSearch(""); }}
            style={{ padding: "9px 14px", background: "#3a1a1a", border: "1px solid #5a2a2a", color: "#ff6b6b", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Task List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
          <Loader2 style={{ width: "28px", height: "28px", color: "#4ade80" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", textAlign: "center" }}>
          <CheckSquare style={{ width: "48px", height: "48px", color: "#767676", marginBottom: "12px" }} />
          <p style={{ color: "#a3a3a3", fontWeight: 600, margin: 0 }}>No tasks found</p>
          <p style={{ color: "#767676", fontSize: "13px", marginTop: "4px" }}>
            {isAdmin ? 'Click "New Task" above.' : "No tasks have been assigned to you yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((task) => {
            const pc = priorityConfig[task.priority] || priorityConfig.low;
            return (
              <div key={task._id} style={{
                background: "#1a1a1a", borderRadius: "14px", padding: "16px 18px",
                boxShadow: task.isOverdue ? "0 2px 12px rgba(255,107,107,0.15)" : "0 2px 8px rgba(0,0,0,0.3)",
                border: task.isOverdue ? "1.5px solid #5a2a2a" : "1px solid #2d2d2d",
                transition: "box-shadow 0.15s"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  {/* Icon */}
                  <div style={{ marginTop: "2px", flexShrink: 0 }}>
                    {task.status === "completed"
                      ? <CheckSquare style={{ width: "20px", height: "20px", color: "#4ade80" }} />
                      : task.isOverdue
                      ? <AlertCircle style={{ width: "20px", height: "20px", color: "#ff6b6b" }} />
                      : <Clock style={{ width: "20px", height: "20px", color: "#fbbf24" }} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
                      <div>
                        <h3 style={{
                          fontSize: "15px", fontWeight: 700, margin: 0,
                          color: task.status === "completed" ? "#767676" : "#4ade80",
                          textDecoration: task.status === "completed" ? "line-through" : "none"
                        }}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p style={{ fontSize: "13px", color: "#767676", margin: "3px 0 0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                        {/* Priority pill */}
                        <span style={{
                          display: "flex", alignItems: "center", gap: "5px",
                          background: pc.bg, color: pc.color,
                          fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px",
                          textTransform: "capitalize"
                        }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: pc.dot, flexShrink: 0 }} />
                          {task.priority}
                        </span>
                        <Badge variant={task.status as any}>{task.status.replace("_", " ")}</Badge>
                        {task.isOverdue && <Badge variant="overdue">overdue</Badge>}
                      </div>
                    </div>

                    {/* Meta */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                      {task.projectId?.title && (
                        <span style={{ fontSize: "12px", background: "#1a2a3a", color: "#60a5fa", padding: "3px 10px", borderRadius: "6px", fontWeight: 600 }}>
                          📁 {task.projectId.title}
                        </span>
                      )}
                      {task.assignedTo && (
                        <span style={{ fontSize: "12px", background: "#2a1a3a", color: "#a78bfa", padding: "3px 10px", borderRadius: "6px", fontWeight: 600 }}>
                          👤 {task.assignedTo.name}
                        </span>
                      )}
                      {task.deadline && (
                        <span style={{ fontSize: "12px", background: task.isOverdue ? "#3a1a1a" : "#2a2a2a", color: task.isOverdue ? "#ff6b6b" : "#767676", padding: "3px 10px", borderRadius: "6px", fontWeight: 600 }}>
                          📅 {new Date(task.deadline).toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        disabled={updatingId === task._id}
                        style={{ fontSize: "12px", padding: "5px 10px", border: "1.5px solid #3a3a3a", borderRadius: "8px", outline: "none", background: "#0f0f0f", color: "#e4e4e7", cursor: "pointer", fontFamily: "inherit" }}>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                      </select>
                      {updatingId === task._id && <Loader2 style={{ width: "14px", height: "14px", color: "#4ade80" }} />}
                      {isAdmin && (
                        <button onClick={() => handleDelete(task._id)} style={{
                          marginLeft: "auto", fontSize: "12px", padding: "5px 14px",
                          background: "#3a1a1a", color: "#ff6b6b", border: "1px solid #5a2a2a",
                          borderRadius: "8px", cursor: "pointer", fontWeight: 600
                        }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setCreateError(""); }} title="Create New Task" size="lg">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Task Title *</label>
            <input value={createForm.title} onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Design landing page" style={formInputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Description</label>
            <textarea value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Task details..." rows={2}
              style={{ ...formInputStyle, resize: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Project *</label>
              <select value={createForm.projectId} onChange={(e) => setCreateForm((f) => ({ ...f, projectId: e.target.value }))}
                style={{ ...formInputStyle, appearance: "auto" }}>
                <option value="">Select a project...</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Assign To</label>
              <select value={createForm.assignedTo} onChange={(e) => setCreateForm((f) => ({ ...f, assignedTo: e.target.value }))}
                style={{ ...formInputStyle, appearance: "auto" }}>
                <option value="">Unassigned</option>
                {allUsers.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Priority</label>
              <select value={createForm.priority} onChange={(e) => setCreateForm((f) => ({ ...f, priority: e.target.value }))}
                style={{ ...formInputStyle, appearance: "auto" }}>
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Deadline</label>
              <input type="date" value={createForm.deadline} onChange={(e) => setCreateForm((f) => ({ ...f, deadline: e.target.value }))}
                style={formInputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
            </div>
          </div>
          {createError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", padding: "10px 13px", borderRadius: "9px" }}>
              ⚠️ {createError}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button onClick={() => setShowCreate(false)} style={{
              flex: 1, padding: "11px", border: "1.5px solid #e5e7eb", borderRadius: "11px",
              fontSize: "14px", fontWeight: 600, color: "#6b7280", background: "white", cursor: "pointer"
            }}>Cancel</button>
            <button onClick={handleCreate} disabled={creating} style={{
              flex: 1, background: creating ? "#c4b5fd" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white", border: "none", borderRadius: "11px", padding: "11px",
              fontSize: "14px", fontWeight: 700, cursor: creating ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "7px"
            }}>
              {creating && <Loader2 style={{ width: "15px", height: "15px" }} />}
              Create Task
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
