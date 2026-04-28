import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    homeLat: user?.homeLat || 40.7128,
    homeLng: user?.homeLng || -74.006,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);
    try {
      await updateProfile(form);
      setMsg("Security profile updated successfully.");
    } catch (e) {
      setErr("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "8px" }}>Security Settings</h2>
        <p className="muted">Configure your primary security parameters and home base.</p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "24px", fontSize: "1.1rem" }}>Profile Configuration</h3>
        <form onSubmit={submit}>
          {msg && <div className="badge ok" style={{ width: "100%", marginBottom: "20px", padding: "12px", borderRadius: "10px", justifyContent: "center" }}>{msg}</div>}
          {err && <div className="error">{err}</div>}

          <div className="form-group">
            <label>Full Name</label>
            <input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
            />
          </div>

          <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "16px", marginBottom: "24px", border: "1px solid var(--border-color)" }}>
            <h4 style={{ fontSize: "0.875rem", marginBottom: "16px", color: "#1e293b" }}>Home Base Coordinates</h4>
            <p className="muted" style={{ fontSize: "0.8rem", marginBottom: "20px" }}>
              The system uses these coordinates to calculate distance-based risk for non-online transactions.
            </p>
            <div style={{ display: "flex", gap: 16 }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Latitude</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={form.homeLat} 
                  onChange={(e) => setForm({ ...form, homeLat: e.target.value })} 
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Longitude</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={form.homeLng} 
                  onChange={(e) => setForm({ ...form, homeLng: e.target.value })} 
                />
              </div>
            </div>
          </div>

          <button className="btn" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Saving..." : "Update Security Profile"}
          </button>
        </form>
      </div>

      <div className="card" style={{ borderLeft: "4px solid #6366f1" }}>
        <h3 style={{ fontSize: "1rem", marginBottom: "8px" }}>Security Context</h3>
        <p className="muted" style={{ fontSize: "0.875rem" }}>
          Your home base is currently set to: <strong style={{ color: "#1e293b" }}>{(user?.homeLat || 0).toFixed(4)}, {(user?.homeLng || 0).toFixed(4)}</strong>. 
          Any physical transaction detected beyond a standard radius of this location will automatically trigger a higher risk variance in the neural assessment.
        </p>
      </div>
    </div>
  );
}
