import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); 
    setErr("");
    setLoading(true);
    try { 
      await register(form.name, form.email, form.password); 
      nav("/login", { state: { message: "Registration successful! Please sign in with your credentials." } }); 
    }
    catch (e) { 
      setErr(e.response?.data?.error || "Registration failed. Please try again."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", padding: "12px", background: "rgba(99, 102, 241, 0.1)", borderRadius: "16px", marginBottom: "20px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "8px" }}>Network Enrollment</h2>
          <p className="muted">Register as a new Security Analyst on the FraudGuard network.</p>
        </div>

        <form onSubmit={submit}>
          {err && <div className="error">{err}</div>}
          
          <div className="form-group">
            <label>Full Legal Name</label>
            <input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Work Email</label>
            <input 
              type="email"
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              required 
              placeholder="name@company.com"
            />
          </div>

          <div className="form-group">
            <label>Security Key (Password)</label>
            <input 
              type="password" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              required
              placeholder="Minimum 8 characters"
            />
          </div>

          <button className="btn" type="submit" disabled={loading} style={{ width: "100%", marginTop: "12px" }}>
            {loading ? "Enrolling..." : "Complete Enrollment"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "32px", fontSize: "0.875rem" }}>
          <span className="muted">Already verified?</span>{" "}
          <Link to="/login" style={{ fontWeight: 700, color: "var(--primary)" }}>Sign In to Terminal</Link>
        </div>
      </div>
    </div>
  );
}
