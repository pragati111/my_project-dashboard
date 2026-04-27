/* eslint-disable */
import axios from "axios";
import { useState, useEffect } from "react";

/* ─── DUMMY DATA ─────────────────────────────────────────── */
const getDummyOrders = () => [
  {
    _id: "ORD001123456", totalAmount: 1250, status: "PLACED",
    items: [{ name: "Wireless Mouse", quantity: 2, sellingPrice: 599 }, { name: "USB Keyboard", quantity: 1, sellingPrice: 1200 }],
    trackingUpdates: [], adminModified: false,
  },
  {
    _id: "ORD002789012", totalAmount: 3499, status: "SHIPPED",
    items: [{ name: "Noise Cancelling Headphones", quantity: 1, sellingPrice: 3499 }],
    trackingUpdates: [{ status: "Picked Up", location: "Mumbai Hub" }, { status: "In Transit", location: "Nagpur Depot" }],
    adminModified: true,
  },
  {
    _id: "ORD003345678", totalAmount: 799, status: "DELIVERED",
    items: [{ name: "Phone Stand", quantity: 1, sellingPrice: 399 }, { name: "USB-C Cable", quantity: 2, sellingPrice: 200 }],
    trackingUpdates: [{ status: "Delivered", location: "Customer Doorstep" }], adminModified: false,
  },
  {
    _id: "ORD004901234", totalAmount: 12999, status: "CONFIRMED",
    items: [{ name: "Mechanical Keyboard", quantity: 1, sellingPrice: 8999 }, { name: "Wrist Rest", quantity: 1, sellingPrice: 1500 }, { name: "Mousepad XL", quantity: 1, sellingPrice: 2500 }],
    trackingUpdates: [], adminModified: false,
  },
  {
    _id: "ORD005567890", totalAmount: 599, status: "CANCELLED",
    items: [{ name: "Screen Protector", quantity: 3, sellingPrice: 199 }],
    trackingUpdates: [], adminModified: false,
  },
  {
    _id: "ORD006234567", totalAmount: 8499, status: "SHIPPED",
    items: [{ name: "Smart Watch Series 9", quantity: 1, sellingPrice: 8499 }],
    trackingUpdates: [{ status: "Dispatched", location: "Delhi Warehouse" }, { status: "Out for Delivery", location: "Ranchi Hub" }],
    adminModified: true,
  },
  {
    _id: "ORD007890123", totalAmount: 2199, status: "PLACED",
    items: [{ name: "Portable Bluetooth Speaker", quantity: 1, sellingPrice: 1999 }, { name: "Speaker Case", quantity: 1, sellingPrice: 200 }],
    trackingUpdates: [], adminModified: false,
  },
  {
    _id: "ORD008456789", totalAmount: 4999, status: "CONFIRMED",
    items: [{ name: "Graphics Drawing Tablet", quantity: 1, sellingPrice: 4999 }],
    trackingUpdates: [], adminModified: false,
  },
  {
    _id: "ORD009112233", totalAmount: 650, status: "DELIVERED",
    items: [{ name: "HDMI Cable 2m", quantity: 2, sellingPrice: 250 }, { name: "Cable Management Clips", quantity: 1, sellingPrice: 150 }],
    trackingUpdates: [{ status: "Out for Delivery", location: "Ranchi" }, { status: "Delivered", location: "Home" }],
    adminModified: false,
  },
  {
    _id: "ORD010998877", totalAmount: 17999, status: "SHIPPED",
    items: [{ name: "4K Webcam Pro", quantity: 1, sellingPrice: 12999 }, { name: "LED Ring Light", quantity: 1, sellingPrice: 3500 }, { name: "Adjustable Mic Stand", quantity: 1, sellingPrice: 1500 }],
    trackingUpdates: [{ status: "Picked Up", location: "Kolkata Hub" }, { status: "In Transit", location: "Asansol" }],
    adminModified: true,
  },
  {
    _id: "ORD011554433", totalAmount: 399, status: "PLACED",
    items: [{ name: "Microfiber Cloth Pack", quantity: 5, sellingPrice: 79 }],
    trackingUpdates: [], adminModified: false,
  },
  {
    _id: "ORD012221100", totalAmount: 5299, status: "CONFIRMED",
    items: [{ name: "External SSD 500GB", quantity: 1, sellingPrice: 5299 }],
    trackingUpdates: [], adminModified: false,
  },
];

/* ─── STATUS CONFIG ──────────────────────────────────────── */
const STATUS_CONFIG = {
  PLACED:    { bg: "#FFF8E1", color: "#F59E0B", border: "#FDE68A", dot: "#F59E0B" },
  CONFIRMED: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE", dot: "#3B82F6" },
  SHIPPED:   { bg: "#F0F9FF", color: "#0EA5E9", border: "#BAE6FD", dot: "#0EA5E9" },
  DELIVERED: { bg: "#F0FDF4", color: "#22C55E", border: "#BBF7D0", dot: "#22C55E" },
  CANCELLED: { bg: "#FFF1F2", color: "#EF4444", border: "#FECDD3", dot: "#EF4444" },
};

/* ─── STATUS BADGE ───────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB", dot: "#6B7280" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: 20, padding: "3px 10px",
      fontSize: 11, fontWeight: 600, fontFamily: "monospace",
      letterSpacing: "0.4px", textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {status}
    </span>
  );
};

/* ─── STAT CARD ──────────────────────────────────────────── */
const StatCard = ({ label, value, icon, accent }) => (
  <div style={{
    background: "#fff", borderRadius: 12, padding: "16px 20px",
    border: "1px solid #E8EEF7", flex: 1, minWidth: 130,
    display: "flex", alignItems: "center", gap: 14,
    boxShadow: "0 1px 4px rgba(37,99,235,0.06)",
    transition: "box-shadow 0.2s, transform 0.2s",
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,99,235,0.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(37,99,235,0.06)"; e.currentTarget.style.transform = "none"; }}
  >
    <div style={{
      width: 44, height: 44, borderRadius: 10, fontSize: 20,
      background: accent + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#1E3A5F", letterSpacing: "-0.5px" }}>{value}</div>
    </div>
  </div>
);

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDummyData, setUsingDummyData] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState("");
  const [trackingLocation, setTrackingLocation] = useState("");
  const [toast, setToast] = useState(null);

  /* FETCH */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/api/order/admin/all", {
          headers: { Authorization: `Bearer ${token}` }, timeout: 5000,
        });
        if (res.data.orders?.length) { setOrders(res.data.orders); setUsingDummyData(false); }
        else throw new Error("Empty");
      } catch {
        setOrders(getDummyOrders());
        setUsingDummyData(true);
      } finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  /* TOAST */
  const showToast = (message, error = false) => {
    setToast({ message, error });
    setTimeout(() => setToast(null), 2800);
  };

  /* STATUS UPDATE */
  const handleStatusUpdate = async (id, status) => {
    if (usingDummyData) {
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      showToast("Status updated to " + status);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8000/api/order/admin/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      showToast("Status updated to " + status);
    } catch { showToast("Status update failed", true); }
  };

  /* TRACKING */
  const handleAddTracking = async () => {
    if (!trackingStatus.trim() || !trackingLocation.trim()) return;
    const newEntry = { status: trackingStatus, location: trackingLocation, updatedAt: new Date() };
    if (usingDummyData) {
      const updated = { ...selectedOrder, trackingUpdates: [...(selectedOrder.trackingUpdates || []), newEntry] };
      setSelectedOrder(updated);
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      setTrackingStatus(""); setTrackingLocation("");
      showToast("Tracking update added");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`http://localhost:8000/api/order/admin/${selectedOrder._id}/tracking`,
        { status: trackingStatus, location: trackingLocation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedOrder(res.data.order);
      setTrackingStatus(""); setTrackingLocation("");
      showToast("Tracking update added");
    } catch { showToast("Failed to add tracking", true); }
  };

  /* FILTER */
  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === "ALL" || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || o._id.toLowerCase().includes(q) || o.items.some(i => i.name.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  /* STATS */
  const counts = { PLACED: 0, CONFIRMED: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
  let totalRevenue = 0;
  orders.forEach(o => { counts[o.status]++; if (o.status !== "CANCELLED") totalRevenue += o.totalAmount; });

  const inputStyle = {
    width: "100%", border: "1.5px solid #E2EAF4", borderRadius: 8,
    padding: "9px 12px", fontSize: 13, color: "#1E3A5F",
    background: "#F8FAFD", outline: "none", fontFamily: "inherit",
    transition: "border-color 0.2s",
  };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: "#F4F7FC", fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>

      {/* ─── HEADER ─── */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #E8EEF7",
        padding: "18px 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 1px 8px rgba(37,99,235,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #2563EB, #60A5FA)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
          }}>📦</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1E3A5F", letterSpacing: "-0.3px" }}>Order Management</div>
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>
              {orders.length} total orders
              {usingDummyData && <span style={{ marginLeft: 8, color: "#F59E0B", background: "#FFF8E1", border: "1px solid #FDE68A", borderRadius: 4, padding: "1px 6px", fontSize: 10 }}>DEMO DATA</span>}
            </div>
          </div>
        </div>
        <button style={{
          background: "linear-gradient(135deg, #2563EB, #3B82F6)",
          color: "#fff", border: "none", borderRadius: 9, padding: "9px 18px",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 2px 8px rgba(37,99,235,0.3)", display: "flex", alignItems: "center", gap: 6,
        }}>
          + Export Orders
        </button>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ─── STATS ─── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard label="Total Orders" value={orders.length} icon="📦" accent="#2563EB" />
          <StatCard label="Revenue" value={"₹" + totalRevenue.toLocaleString()} icon="💰" accent="#22C55E" />
          <StatCard label="Shipped" value={counts.SHIPPED} icon="🚚" accent="#0EA5E9" />
          <StatCard label="Delivered" value={counts.DELIVERED} icon="✅" accent="#22C55E" />
          <StatCard label="Pending" value={counts.PLACED + counts.CONFIRMED} icon="⏳" accent="#F59E0B" />
          <StatCard label="Cancelled" value={counts.CANCELLED} icon="❌" accent="#EF4444" />
        </div>

        {/* ─── FILTER & SEARCH ─── */}
        <div style={{
          background: "#fff", border: "1px solid #E8EEF7", borderRadius: 12,
          padding: "16px 20px", marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          boxShadow: "0 1px 4px rgba(37,99,235,0.05)",
        }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["ALL", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                cursor: "pointer", border: "1.5px solid",
                borderColor: filterStatus === s ? "#2563EB" : "#E2EAF4",
                background: filterStatus === s ? "#EFF6FF" : "transparent",
                color: filterStatus === s ? "#2563EB" : "#94A3B8",
                transition: "all 0.15s",
              }}>
                {s === "ALL" ? `All (${orders.length})` : `${s} (${counts[s] ?? 0})`}
              </button>
            ))}
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search by order ID or item..."
            style={{ ...inputStyle, width: 260, background: "#F8FAFD" }}
            onFocus={e => e.target.style.borderColor = "#2563EB"}
            onBlur={e => e.target.style.borderColor = "#E2EAF4"}
          />
        </div>

        {/* ─── TABLE ─── */}
        <div style={{
          background: "#fff", borderRadius: 14, border: "1px solid #E8EEF7",
          overflow: "hidden", boxShadow: "0 1px 8px rgba(37,99,235,0.06)",
        }}>
          {/* Table Head */}
          <div style={{
            display: "grid", gridTemplateColumns: "130px 1fr 120px 150px 180px 100px",
            padding: "12px 20px", background: "#F8FAFD",
            borderBottom: "1.5px solid #E8EEF7",
            fontSize: 11, fontWeight: 700, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.8px",
          }}>
            <div>Order ID</div><div>Items</div><div>Amount</div>
            <div>Status</div><div>Update Status</div><div>Actions</div>
          </div>

          {/* Loading bar */}
          {loading && (
            <div style={{ height: 3, background: "#EFF6FF", position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent, #2563EB, transparent)",
                animation: "shimmer 1.4s infinite",
              }} />
            </div>
          )}

          {/* Rows */}
          {filtered.length === 0 && !loading ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
              No orders found
            </div>
          ) : filtered.map((row, i) => {
            const mainItem = row.items[0];
            const extraCount = row.items.length - 1;
            return (
              <div key={row._id} style={{
                display: "grid", gridTemplateColumns: "130px 1fr 120px 150px 180px 100px",
                padding: "14px 20px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? "1px solid #F1F5FA" : "none",
                transition: "background 0.15s",
                animationDelay: `${i * 0.04}s`,
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#F8FAFD"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* ID */}
                <div style={{ fontFamily: "monospace", fontSize: 13, color: "#2563EB", fontWeight: 700 }}>
                  #{row._id.slice(-6)}
                </div>

                {/* Items */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1E3A5F" }}>{mainItem.name}</div>
                  {extraCount > 0 && (
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                      +{extraCount} more item{extraCount > 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#1E3A5F" }}>
                  ₹{row.totalAmount.toLocaleString()}
                </div>

                {/* Status Badge */}
                <div><StatusBadge status={row.status} /></div>

                {/* Select */}
                <div>
                  <select
                    value={row.status}
                    onChange={e => handleStatusUpdate(row._id, e.target.value)}
                    style={{
                      border: "1.5px solid #E2EAF4", borderRadius: 8, padding: "6px 10px",
                      fontSize: 12, fontWeight: 600, color: "#1E3A5F", background: "#F8FAFD",
                      cursor: "pointer", outline: "none", fontFamily: "inherit",
                    }}
                  >
                    {["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* View Button */}
                <div>
                  <button onClick={() => { setSelectedOrder(row); setModalOpen(true); }} style={{
                    background: "transparent", border: "1.5px solid #BFDBFE",
                    color: "#2563EB", borderRadius: 8, padding: "6px 14px",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.borderColor = "#2563EB"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#BFDBFE"; }}
                  >
                    View →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── MODAL ─── */}
      {modalOpen && selectedOrder && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(15,30,60,0.45)",
            backdropFilter: "blur(4px)", zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 18, width: 560, maxHeight: "85vh",
              overflowY: "auto", boxShadow: "0 24px 64px rgba(15,30,60,0.2)",
              border: "1px solid #E8EEF7",
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: "22px 24px 18px", borderBottom: "1px solid #F1F5FA",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              position: "sticky", top: 0, background: "#fff", borderRadius: "18px 18px 0 0",
            }}>
              <div>
                <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Order Details</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#1E3A5F" }}>
                  #{selectedOrder._id}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <StatusBadge status={selectedOrder.status} />
                <button onClick={() => setModalOpen(false)} style={{
                  width: 32, height: 32, borderRadius: 8, border: "1.5px solid #E2EAF4",
                  background: "#F8FAFD", color: "#94A3B8", cursor: "pointer", fontSize: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>
              </div>
            </div>

            <div style={{ padding: "20px 24px 24px" }}>
              {/* Items */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Items Ordered</div>
              <div style={{ border: "1px solid #E8EEF7", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: i < selectedOrder.items.length - 1 ? "1px solid #F1F5FA" : "none",
                    background: i % 2 === 0 ? "#fff" : "#FAFBFF",
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1E3A5F" }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#2563EB" }}>
                      ₹{(item.sellingPrice * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
                <div style={{
                  padding: "12px 16px", background: "#EFF6FF",
                  display: "flex", justifyContent: "space-between",
                  borderTop: "1.5px solid #BFDBFE",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1E3A5F" }}>Total</div>
                  <div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 800, color: "#2563EB" }}>
                    ₹{selectedOrder.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Tracking Section */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>Tracking Updates</div>

              {/* Add Tracking */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <input
                    placeholder="Status (e.g. Dispatched)"
                    value={trackingStatus}
                    onChange={e => setTrackingStatus(e.target.value)}
                    style={{ ...inputStyle }}
                    onFocus={e => e.target.style.borderColor = "#2563EB"}
                    onBlur={e => e.target.style.borderColor = "#E2EAF4"}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    placeholder="Location"
                    value={trackingLocation}
                    onChange={e => setTrackingLocation(e.target.value)}
                    style={{ ...inputStyle }}
                    onFocus={e => e.target.style.borderColor = "#2563EB"}
                    onBlur={e => e.target.style.borderColor = "#E2EAF4"}
                  />
                </div>
                <button onClick={handleAddTracking} style={{
                  background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  color: "#fff", border: "none", borderRadius: 8,
                  padding: "0 16px", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                }}>
                  + Add
                </button>
              </div>

              {/* Tracking History */}
              {selectedOrder.trackingUpdates?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedOrder.trackingUpdates.map((t, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", borderRadius: 8,
                      background: "#F8FAFD", border: "1px solid #E8EEF7",
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#2563EB", flexShrink: 0,
                        boxShadow: "0 0 0 3px rgba(37,99,235,0.15)",
                      }} />
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", flex: 1 }}>{t.status}</div>
                      <div style={{ fontSize: 12, color: "#94A3B8", fontFamily: "monospace" }}>📍 {t.location}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: "18px", textAlign: "center", background: "#F8FAFD",
                  border: "1px dashed #E2EAF4", borderRadius: 8,
                  fontSize: 13, color: "#94A3B8",
                }}>
                  No tracking updates yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TOAST ─── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 999,
          background: toast.error ? "#FFF1F2" : "#F0FDF4",
          border: `1px solid ${toast.error ? "#FECDD3" : "#BBF7D0"}`,
          color: toast.error ? "#EF4444" : "#16A34A",
          padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {toast.error ? "⚠️" : "✓"} {toast.message}
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        select { appearance: auto; }
      `}</style>
    </div>
  );
}