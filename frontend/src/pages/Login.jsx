import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); 
    setErr("");
    setSuccess("");
    setLoading(true);
    try { 
      await login(email, password); 
      nav("/"); 
    }
    catch (e) { 
      setErr(e.response?.data?.error || "Login failed. Please check your credentials."); 
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
          <h2 style={{ fontSize: "1.75rem", marginBottom: "8px" }}>Secure Access</h2>
          <p className="muted">Enter your credentials to access the FraudGuard network.</p>
        </div>
        
        <form onSubmit={submit}>
          {success && <div className="badge ok" style={{ width: "100%", marginBottom: "24px", padding: "12px", borderRadius: "12px", justifyContent: "center" }}>{success}</div>}
          {err && <div className="error">{err}</div>}
          
          <div className="form-group">
            <label>Work Email</label>
            <input 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="name@company.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Security Key (Password)</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button className="btn" type="submit" disabled={loading} style={{ width: "100%", marginTop: "12px" }}>
            {loading ? "Authenticating..." : "Authorize Access"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "32px", fontSize: "0.875rem" }}>
          <span className="muted">Unauthorized personnel?</span>{" "}
          <Link to="/register" style={{ fontWeight: 700, color: "var(--primary)" }}>Register New Entity</Link>
        </div>
      </div>
    </div>
  );
}
