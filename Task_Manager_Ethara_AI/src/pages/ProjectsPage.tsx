import { useEffect, useState } from "react";
import { Plus, Users, Trash2, Loader2, FolderOpen, UserPlus, X } from "lucide-react";
import { getProjects, createProject, deleteProject, getAllUsers, addMember, removeMember } from "../api/projects";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const PROJECT_GRADIENTS = [
  "linear-gradient(135deg, #22c55e, #4ade80)",
  "linear-gradient(135deg, #10b981, #34d399)",
  "linear-gradient(135deg, #f59e0b, #fbbf24)",
  "linear-gradient(135deg, #ef4444, #f87171)",
  "linear-gradient(135deg, #8b5cf6, #a78bfa)",
  "linear-gradient(135deg, #3b82f6, #60a5fa)",
];

export default function ProjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [projects, setProjects] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.projects || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    if (isAdmin) getAllUsers().then((r) => setAllUsers(r.users || [])).catch(console.error);
  }, [isAdmin]);

  const handleCreate = async () => {
    if (!createForm.title.trim()) return setCreateError("Title is required.");
    setCreating(true); setCreateError("");
    try {
      await createProject(createForm);
      setCreateForm({ title: "", description: "" });
      setShowCreate(false);
      load();
    } catch (e: any) {
      setCreateError(e?.response?.data?.message || "Error creating project.");
    } finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    try { await deleteProject(id); load(); } catch (e) { console.error(e); }
  };

  const handleAddMember = async () => {
    if (!selectedUserId || !selectedProject) return;
    setAddingMember(true);
    try {
      const res = await addMember(selectedProject._id, selectedUserId);
      setSelectedProject(res.project);
      setSelectedUserId("");
      load();
    } catch (e: any) { alert(e?.response?.data?.message || "Error adding member."); }
    finally { setAddingMember(false); }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedProject) return;
    try {
      const res = await removeMember(selectedProject._id, userId);
      setSelectedProject(res.project);
      load();
    } catch (e: any) { alert(e?.response?.data?.message || "Error removing member."); }
  };

  const nonMembers = allUsers.filter(
    (u) => !selectedProject?.members?.some((m: any) => (m._id || m) === u._id)
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 13px", border: "1.5px solid #3a3a3a",
    borderRadius: "10px", fontSize: "14px", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", color: "#e4e4e7", background: "#1a1a1a"
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#4ade80", margin: 0, letterSpacing: "-0.3px" }}>Projects</h1>
          <p style={{ color: "#767676", margin: "3px 0 0", fontSize: "13px" }}>
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
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
            <Plus style={{ width: "16px", height: "16px" }} /> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
          <Loader2 style={{ width: "28px", height: "28px", color: "#4ade80" }} />
        </div>
      ) : projects.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", textAlign: "center" }}>
          <FolderOpen style={{ width: "48px", height: "48px", color: "#767676", marginBottom: "12px" }} />
          <p style={{ color: "#a3a3a3", fontWeight: 600, margin: 0 }}>No projects found</p>
          {isAdmin && <p style={{ color: "#767676", fontSize: "13px", marginTop: "4px" }}>Click "New Project" above.</p>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {projects.map((project, idx) => {
            const gradient = PROJECT_GRADIENTS[idx % PROJECT_GRADIENTS.length];
            return (
              <div key={project._id} style={{
                background: "#1a1a1a", borderRadius: "18px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.3)", border: "1px solid #2d2d2d",
                overflow: "hidden", transition: "transform 0.15s, box-shadow 0.15s"
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 28px rgba(74,222,128,0.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)"; }}>
                {/* Color top bar */}
                <div style={{ height: "6px", background: gradient }} />

                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontWeight: 700, fontSize: "16px", color: "#4ade80", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {project.title}
                      </h3>
                      {project.description && (
                        <p style={{ fontSize: "13px", color: "#767676", margin: "4px 0 0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {project.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={project.status === "active" ? "active" : "archived"}>{project.status}</Badge>
                  </div>

                  {/* Members count */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                    <Users style={{ width: "13px", height: "13px", color: "#767676" }} />
                    <span style={{ fontSize: "12px", color: "#767676", fontWeight: 500 }}>
                      {project.members?.length || 0} member{project.members?.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Avatars */}
                  {project.members?.length > 0 && (
                    <div style={{ display: "flex", marginBottom: "14px" }}>
                      {project.members.slice(0, 5).map((m: any, i: number) => (
                        <div key={m._id} title={m.name} style={{
                          width: "28px", height: "28px", borderRadius: "50%",
                          background: PROJECT_GRADIENTS[i % PROJECT_GRADIENTS.length],
                          border: "2px solid #1a1a1a", display: "flex", alignItems: "center",
                          justifyContent: "center", color: "white", fontSize: "11px",
                          fontWeight: 700, marginLeft: i > 0 ? "-8px" : "0",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
                        }}>
                          {m.name?.[0]?.toUpperCase()}
                        </div>
                      ))}
                      {project.members.length > 5 && (
                        <div style={{
                          width: "28px", height: "28px", borderRadius: "50%",
                          background: "#2d2d2d", border: "2px solid #1a1a1a", marginLeft: "-8px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "10px", fontWeight: 700, color: "#767676"
                        }}>
                          +{project.members.length - 5}
                        </div>
                      )}
                    </div>
                  )}

                  {isAdmin && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => { setSelectedProject(project); setShowMembers(true); }}
                        style={{
                          display: "flex", alignItems: "center", gap: "5px",
                          fontSize: "12px", fontWeight: 600, color: "#6366f1",
                          background: "#eef2ff", border: "none", padding: "7px 12px",
                          borderRadius: "8px", cursor: "pointer"
                        }}>
                        <UserPlus style={{ width: "13px", height: "13px" }} /> Members
                      </button>
                      <button onClick={() => handleDelete(project._id)}
                        style={{
                          display: "flex", alignItems: "center", gap: "5px",
                          fontSize: "12px", fontWeight: 600, color: "#dc2626",
                          background: "#fef2f2", border: "none", padding: "7px 12px",
                          borderRadius: "8px", cursor: "pointer", marginLeft: "auto"
                        }}>
                        <Trash2 style={{ width: "13px", height: "13px" }} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setCreateError(""); }} title="Create New Project">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Project Title *</label>
            <input value={createForm.title} onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Website Redesign" style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#10b981")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Description</label>
            <textarea value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the project..." rows={3}
              style={{ ...inputStyle, resize: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "#10b981")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
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
              flex: 1, background: creating ? "#6ee7b7" : "linear-gradient(135deg, #10b981, #059669)",
              color: "white", border: "none", borderRadius: "11px", padding: "11px",
              fontSize: "14px", fontWeight: 700, cursor: creating ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "7px"
            }}>
              {creating && <Loader2 style={{ width: "15px", height: "15px" }} />}
              Create Project
            </button>
          </div>
        </div>
      </Modal>

      {/* Members Modal */}
      <Modal isOpen={showMembers} onClose={() => { setShowMembers(false); setSelectedProject(null); }}
        title={`Members — ${selectedProject?.title}`} size="lg">
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Add Member</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}
                style={{ flex: 1, padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", outline: "none", background: "white", fontFamily: "inherit" }}>
                <option value="">Select a user...</option>
                {nonMembers.map((u: any) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
              </select>
              <button onClick={handleAddMember} disabled={!selectedUserId || addingMember} style={{
                background: !selectedUserId || addingMember ? "#d1fae5" : "linear-gradient(135deg, #10b981, #059669)",
                color: "white", border: "none", borderRadius: "10px", padding: "10px 18px",
                fontSize: "14px", fontWeight: 700, cursor: !selectedUserId ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "6px"
              }}>
                {addingMember ? <Loader2 style={{ width: "15px", height: "15px" }} /> : <UserPlus style={{ width: "15px", height: "15px" }} />}
                Add
              </button>
            </div>
          </div>

          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "10px" }}>
              Current Members ({selectedProject?.members?.length || 0})
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "260px", overflowY: "auto" }}>
              {selectedProject?.members?.map((m: any) => (
                <div key={m._id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#f8fafc", padding: "10px 14px", borderRadius: "10px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: "14px", fontWeight: 700, flexShrink: 0
                    }}>
                      {m.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e1b4b", margin: 0 }}>{m.name}</p>
                      <p style={{ fontSize: "12px", color: "#94a3b8", margin: "1px 0 0" }}>{m.email}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Badge variant={m.role}>{m.role}</Badge>
                    {selectedProject?.createdBy?._id !== m._id && (
                      <button onClick={() => handleRemoveMember(m._id)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#94a3b8", padding: "4px", borderRadius: "6px", display: "flex"
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; (e.currentTarget as HTMLButtonElement).style.background = "none"; }}>
                        <X style={{ width: "15px", height: "15px" }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
