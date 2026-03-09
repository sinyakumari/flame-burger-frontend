import React from "react";
import "./OrderDrawer.css";

/* ── helpers ─────────────────────────────────────────── */
const resolveImage = (img) => {
  if (!img) return null;
  if (img.startsWith("http") || img.startsWith("/uploads")) return img;
  if (img.startsWith("/assets")) return img;
  return `/src/assets/${img}`;
};

const STATUS_META = {
  Pending:   { color: "#facc15", bg: "rgba(250,204,21,0.12)",  icon: "⏳" },
  Completed: { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   icon: "✅" },
  Cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: "❌" },
};

/* ── component ───────────────────────────────────────── */
const OrderDrawer = ({ order, onClose, onStatusChange }) => {
  if (!order) return null;

  const shortId   = order._id.slice(-6).toUpperCase();
  const subtotal  = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount  = order.coupon?.discount
    ?? (order.totalAmount < subtotal ? subtotal - order.totalAmount : 0);
  const delivery  = order.deliveryFee ?? 0;
  const finalTotal = order.finalAmount ?? order.totalAmount;
  const meta = STATUS_META[order.status] || STATUS_META.Pending;

  return (
    <>
      {/* ── Overlay ── */}
      <div className="od-overlay" onClick={onClose} />

      {/* ── Drawer Panel ── */}
      <aside className="od-panel">

        {/* ══ Header ══════════════════════════════════════ */}
        <header className="od-header">
          <div className="od-header-left">
            <div className="od-header-avatar">
              {(order.name || order.user?.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="od-header-name">{order.name || order.user?.name || "Customer"}</p>
              <p className="od-header-id">Order #{shortId}</p>
            </div>
          </div>
          <button className="od-close" onClick={onClose}>✕</button>
        </header>

        {/* ══ Scrollable Body ═════════════════════════════ */}
        <div className="od-body">

          {/* ── Status Banner ── */}
          <div className="od-status-banner" style={{ background: meta.bg, borderColor: meta.color + "44" }}>
            <span className="od-status-icon">{meta.icon}</span>
            <div>
              <p className="od-status-label">Current Status</p>
              <p className="od-status-text" style={{ color: meta.color }}>{order.status}</p>
            </div>
            <select
              className="od-status-select"
              value={order.status}
              onChange={(e) => onStatusChange(order._id, e.target.value)}
              style={{ borderColor: meta.color + "66" }}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* ── Customer ── */}
          <section className="od-section">
            <h4 className="od-section-title">Customer</h4>
            <div className="od-info-row">
              <InfoBlock label="Name"  value={order.name || order.user?.name || "—"} />
              <InfoBlock label="Phone" value={order.phone || order.user?.phone || "Not provided"} />
            </div>
          </section>

          {/* ── Delivery ── */}
          <section className="od-section">
            <h4 className="od-section-title">Delivery Address</h4>
            <div className="od-address-card">
              <span className="od-address-icon">📍</span>
              <div>
                <p className="od-address-main">{order.address || "Not provided"}</p>
                {(order.city || order.area) && (
                  <p className="od-address-sub">{order.city || order.area}</p>
                )}
              </div>
            </div>
          </section>

          {/* ── Payment ── */}
          <section className="od-section">
            <h4 className="od-section-title">Payment</h4>
            <div className="od-info-row">
              <InfoBlock label="Method" value={order.paymentMethod || "Cash on Delivery"} />
              <InfoBlock
                label="Status"
                value={order.isPaid ? "Paid" : "Unpaid"}
                valueStyle={{ color: order.isPaid ? "#22c55e" : "#facc15", fontWeight: 700 }}
              />
            </div>
          </section>

          {/* ── Coupon ── */}
          <section className="od-section">
            <h4 className="od-section-title">Coupon</h4>
            {order.coupon ? (
              <div className="od-coupon-card">
                <div>
                  <p className="od-coupon-code">{order.coupon.code}</p>
                  <p className="od-coupon-sub">Applied coupon</p>
                </div>
                <p className="od-coupon-discount">-${discount.toFixed(2)}</p>
              </div>
            ) : (
              <p className="od-no-coupon">No coupon applied</p>
            )}
          </section>

          {/* ── Order Items ── */}
          <section className="od-section">
            <h4 className="od-section-title">
              Order Items
              <span className="od-item-count">{order.items.length}</span>
            </h4>
            <div className="od-items-list">
              {order.items.map((item, idx) => (
                <ItemCard key={idx} item={item} />
              ))}
            </div>
          </section>

          {/* ── Summary ── */}
          <section className="od-section">
            <h4 className="od-section-title">Order Summary</h4>
            <div className="od-summary-card">
              <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              {discount > 0 && (
                <SummaryRow label="Discount" value={`-$${discount.toFixed(2)}`} valueColor="#22c55e" />
              )}
              {delivery > 0 && (
                <SummaryRow label="Delivery Fee" value={`$${delivery.toFixed(2)}`} />
              )}
              <div className="od-summary-divider" />
              <SummaryRow label="Total" value={`$${finalTotal.toFixed(2)}`} isTotal />
            </div>
          </section>

          {/* ── Timestamps ── */}
          <section className="od-section">
            <h4 className="od-section-title">Timestamps</h4>
            <div className="od-info-row">
              <InfoBlock
                label="Order Date"
                value={new Date(order.createdAt).toLocaleDateString()}
              />
              <InfoBlock
                label="Order Time"
                value={new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              />
            </div>
          </section>

        </div>{/* end od-body */}
      </aside>
    </>
  );
};

/* ── sub-components ──────────────────────────────────── */

const InfoBlock = ({ label, value, valueStyle = {} }) => (
  <div className="od-info-block">
    <p className="od-info-label">{label}</p>
    <p className="od-info-value" style={valueStyle}>{value}</p>
  </div>
);

const SummaryRow = ({ label, value, valueColor, isTotal }) => (
  <div className={`od-summary-row${isTotal ? " od-summary-row--total" : ""}`}>
    <span>{label}</span>
    <span style={valueColor ? { color: valueColor } : {}}>{value}</span>
  </div>
);

const ItemCard = ({ item }) => {
  const imgSrc = resolveImage(item.img);

  const handleImgError = (e) => {
    if (!e.target.dataset.tried) {
      e.target.dataset.tried = "true";
      e.target.src = `http://localhost:3000/uploads/${item.img}`;
    } else {
      e.target.style.display = "none";
      e.target.nextElementSibling.style.display = "flex";
    }
  };

  return (
    <div className="od-item-card">
      <div className="od-item-img-wrap">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.name}
            className="od-item-img"
            onError={handleImgError}
          />
        ) : null}
        <div className="od-item-img-placeholder" style={{ display: imgSrc ? "none" : "flex" }}>
          🍔
        </div>
      </div>
      <div className="od-item-details">
        <p className="od-item-name">{item.name}</p>
        <p className="od-item-custom">{item.customization || "Standard"}</p>
        <div className="od-item-meta">
          <span className="od-item-price">${item.price.toFixed(2)}</span>
          <span className="od-item-qty">× {item.quantity}</span>
        </div>
      </div>
      <div className="od-item-total">
        ${(item.price * item.quantity).toFixed(2)}
      </div>
    </div>
  );
};

export default OrderDrawer;
