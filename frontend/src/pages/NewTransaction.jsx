import { useState } from "react";
import api from "../services/api";

const NewIcons = {
  Target: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
};

export default function NewTransaction() {
  const [form, setForm] = useState({
    amount: 100, merchant: "", category: "other",
    lat: 40.7128, lng: -74.006, isOnline: false,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault(); 
    setErr(""); 
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.post("/transactions", {
        ...form,
        amount: parseFloat(form.amount),
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
      });
      setResult(data);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to process transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "8px" }}>Risk Assessment</h2>
        <p className="muted">Execute real-time security protocols on new transaction entries.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: "32px", alignItems: "start" }}>
        <div className="card" style={{ padding: "32px" }}>
          <h3 style={{ marginBottom: "24px", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <NewIcons.Target /> Transaction Entry
          </h3>
          <form onSubmit={submit}>
            {err && <div className="error">{err}</div>}
            
            <div className="form-group">
              <label>Merchant Entity</label>
              <input 
                placeholder="Paypal, Amazon, Stripe..."
                value={form.merchant} 
                onChange={(e) => setForm({ ...form, merchant: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Transaction Amount (USD)</label>
              <input 
                type="number" 
                step="0.01" 
                value={form.amount} 
                onChange={(e) => setForm({ ...form, amount: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Operations Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {["grocery","electronics","travel","gambling","atm","online","other"].map((c) =>
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Geocode: Lat</label>
                <input type="number" step="0.0001" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Geocode: Lng</label>
                <input type="number" step="0.0001" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
              </div>
            </div>

            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px", background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
              <input 
                type="checkbox" 
                id="isOnline"
                style={{ width: "20px", height: "20px", cursor: "pointer", margin: 0 }}
                checked={form.isOnline} 
                onChange={(e) => setForm({ ...form, isOnline: e.target.checked })} 
              />
              <label htmlFor="isOnline" style={{ marginBottom: 0, cursor: "pointer", userSelect: "none" }}>Remote/Online Transaction</label>
            </div>

            <div style={{ marginTop: "32px" }}>
              <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Decrypting Risk..." : "Analyze Protocols"}
              </button>
            </div>
          </form>
        </div>

        {result && (
          <div className="card" style={{ animation: "slideUp 0.6s var(--transition-slow)", borderTop: "4px solid " + (result.prediction.isFraud ? "var(--danger)" : "var(--success)") }}>
            <h3 style={{ marginBottom: "20px", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "10px" }}>
              <NewIcons.Shield /> Assessment Result
            </h3>
            
            <div style={{ 
              background: result.prediction.isFraud ? "var(--danger-bg)" : "var(--success-bg)",
              padding: "24px",
              borderRadius: "16px",
              textAlign: "center",
              marginBottom: "32px",
              border: `1.5px solid ${result.prediction.isFraud ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`
            }}>
              <div className="stat-label" style={{ color: result.prediction.isFraud ? "var(--danger)" : "var(--success)" }}>Final Evaluation</div>
              <div className="stat-value" style={{ 
                color: result.prediction.isFraud ? "var(--danger)" : "var(--success)",
                fontSize: "1.75rem",
                marginTop: "8px"
              }}>
                {result.prediction.isFraud ? "FLAGGED: ANOMALOUS" : "VERIFIED: SECURE"}
              </div>
              <div style={{ marginTop: "12px" }}>
                <span className="muted">Intelligence Confidence:</span>
                <span style={{ fontWeight: 800, marginLeft: "6px", color: result.prediction.isFraud ? "var(--danger)" : "var(--success)" }}>{(result.prediction.score * 100).toFixed(1)}%</span>
              </div>
            </div>

            <h4 style={{ fontSize: "0.875rem", marginBottom: "16px", fontWeight: 800, color: "#1e293b" }}>Neural Network Contributors</h4>
            <div className="table-container" style={{ border: "1px solid var(--border-color)" }}>
              <table>
                <thead>
                  <tr style={{ background: "#f8fafc" }}><th>Feature Variable</th><th style={{ textAlign: "right" }}>Variance Impact</th></tr>
                </thead>
                <tbody>
                  {Object.entries(result.prediction.contributions)
                    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                    .map(([k, v]) => (
                      <tr key={k}>
                        <td className="muted" style={{ fontSize: "0.8rem" }}>{k}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: v > 0 ? "var(--danger)" : "var(--success)" }}>
                          {v > 0 ? "+" : ""}{(v || 0).toFixed(4)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
