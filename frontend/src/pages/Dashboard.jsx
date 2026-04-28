import { useEffect, useState } from "react";
import api from "../services/api";

const DashboardIcons = {
  Scan: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary)" }}><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><line x1="7" y1="12" x2="17" y2="12"></line></svg>,
  Alert: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--danger)" }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  Check: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--success)" }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  Shield: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#8b5cf6" }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
};

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const load = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const [a, b, c] = await Promise.all([
        api.get(`/transactions?page=${page}&limit=10`),
        api.get("/transactions/stats"),
        api.get("/model/evaluate"),
      ]);
      setItems(a.data.data.items || []);
      setPagination(a.data.data.pagination || {});
      setStats(b.data.data || {});
      setMetrics(c.data.data || {});
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || "Failed to load dashboard data";
      setError(errMsg);
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  if (loading && pagination.currentPage === 1) {
    return <div className="muted" style={{ padding: "40px", textAlign: "center" }}>Synchronizing Intelligence...</div>;
  }

  if (error && pagination.currentPage === 1) {
    return (
      <div className="card" style={{ borderColor: "var(--danger)", background: "rgba(239, 68, 68, 0.05)" }}>
        <div style={{ color: "var(--danger)", fontSize: "0.9rem", marginBottom: "16px" }}>
          <strong>Error:</strong> {error}
        </div>
        <button className="btn" onClick={() => load()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Dashboard Analytics Section */}
      <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: "2rem", marginBottom: "8px" }}>Security Overview</h2>
          <p className="muted">Monitoring credit transactions with real-time AI classification.</p>
        </div>
        <div style={{ color: "var(--success)", fontSize: "0.875rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "8px", height: "8px", background: "var(--success)", borderRadius: "50%", boxShadow: "0 0 12px var(--success)" }}></div>
          SYSTEM LIVE
        </div>
      </div>

      <div className="grid">
        <div className="card stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <DashboardIcons.Scan />
          </div>
          <div className="stat-label">Total Volume</div>
          <div className="stat-value">{stats?.total ?? "0"}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total transactions processed</div>
        </div>
        <div className="card stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <DashboardIcons.Alert />
          </div>
          <div className="stat-label">Anomalies Detected</div>
          <div className="stat-value" style={{ color: "var(--danger)" }}>{stats?.fraud ?? "0"}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Suspected fraudulent activities</div>
        </div>
        <div className="card stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <DashboardIcons.Shield />
          </div>
          <div className="stat-label">Fraud Rate</div>
          <div className="stat-value">{stats ? (stats.fraudRate * 100).toFixed(2) + "%" : "—%"}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Global occurrence percentage</div>
        </div>
        <div className="card stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <DashboardIcons.Check />
          </div>
          <div className="stat-label">Loss Intercepted</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>${stats?.fraudAmount?.toLocaleString() ?? "0"}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Recovered financial assets</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "8px", position: "relative", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(to right, rgba(99, 102, 241, 0.05), transparent)", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}></div>
        <div style={{ position: "relative" }}>
          <h3 style={{ marginBottom: "24px", fontSize: "1.1rem" }}>Predictive Intelligence Report</h3>
          <div className="grid">
            {metrics ? (
              <>
                <div>
                  <div className="stat-label">Precision</div>
                  <div className="stat-value" style={{ fontSize: "1.5rem" }}>{(metrics.precision*100).toFixed(1)}%</div>
                  <div className="progress-bg" style={{ marginTop: "8px" }}><div className="progress-fill" style={{ width: `${metrics.precision*100}%`, background: "var(--primary-gradient)" }}></div></div>
                </div>
                <div>
                  <div className="stat-label">Recall</div>
                  <div className="stat-value" style={{ fontSize: "1.5rem" }}>{(metrics.recall*100).toFixed(1)}%</div>
                  <div className="progress-bg" style={{ marginTop: "8px" }}><div className="progress-fill" style={{ width: `${metrics.recall*100}%`, background: "var(--primary-gradient)" }}></div></div>
                </div>
                <div>
                  <div className="stat-label">F1 Score</div>
                  <div className="stat-value" style={{ fontSize: "1.5rem" }}>{(metrics.f1*100).toFixed(1)}%</div>
                  <div className="progress-bg" style={{ marginTop: "8px" }}><div className="progress-fill" style={{ width: `${metrics.f1*100}%`, background: "var(--primary-gradient)" }}></div></div>
                </div>
                <div>
                  <div className="stat-label">Accuracy</div>
                  <div className="stat-value" style={{ fontSize: "1.5rem" }}>{(metrics.accuracy*100).toFixed(1)}%</div>
                  <div className="progress-bg" style={{ marginTop: "8px" }}><div className="progress-fill" style={{ width: `${metrics.accuracy*100}%`, background: "var(--primary-gradient)" }}></div></div>
                </div>
              </>
            ) : (
                <div className="muted">Gathering model performance data...</div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem" }}>Real-time Transaction Stream</h3>
            <p className="muted" style={{ fontSize: "0.8rem" }}>Incoming credit card operations under surveillance.</p>
          </div>
          <button className="btn ghost" style={{ padding: "8px 16px", borderRadius: "10px" }} onClick={() => load(1)}>Recalibrate</button>
        </div>
        {error && pagination.currentPage > 1 && (
          <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(239, 68, 68, 0.05)", borderColor: "var(--danger)", color: "var(--danger)", fontSize: "0.875rem", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
            {error}
          </div>
        )}
          <table>
            <thead>
              <tr>
                <th>TIMESTAMP</th><th>MERCHANT ENTITY</th><th>CATEGORY</th>
                <th>AMOUNT</th><th>RISK ASSESSMENT</th><th>SECURITY STATUS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t._id}>
                  <td className="muted" style={{ fontSize: "0.8rem" }}>{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                  <td style={{ fontWeight: 700, color: "#334155" }}>{t.merchant}</td>
                  <td className="muted">{t.category}</td>
                  <td style={{ fontWeight: 800 }}>${(t.amount || 0).toFixed(2)}</td>
                  <td style={{ width: "160px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="progress-bg" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${(t.fraudScore || 0) * 100}%`, background: t.fraudScore > 0.5 ? "var(--danger)" : "var(--success)" }}></div>
                      </div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, minWidth: "30px", textAlign: "right" }}>{((t.fraudScore || 0) * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={"badge " + (t.isFraud ? "fraud" : "ok")}>
                      {t.isFraud ? "ANOMALOUS" : "VERIFIED"}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan="6" className="muted" style={{ textAlign: "center", padding: "60px" }}>Awaiting network traffic...</td></tr>}
            </tbody>
          </table>
        </div>
        
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "32px" }}>
            <button 
              className="btn ghost" 
              style={{ padding: "8px 16px" }} 
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => {
                const target = Math.max(1, pagination.currentPage - 1);
                load(target);
              }}
            >
              Previous
            </button>
            <span className="muted" style={{ fontWeight: 700 }}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button 
              className="btn ghost" 
              style={{ padding: "8px 16px" }} 
              disabled={!pagination.hasNextPage || loading}
              onClick={() => {
                const target = Math.min(pagination.totalPages, pagination.currentPage + 1);
                load(target);
              }}
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}
