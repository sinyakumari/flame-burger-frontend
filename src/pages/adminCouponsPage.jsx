import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./adminCoupons.css";

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(null);

  // Form States (Including Task 7 requirements)
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState(50); // Maps to total users limit
  const [maxUsagePerUser, setMaxUsagePerUser] = useState(1); // Maps to Task 7
  const [expiryDate, setExpiryDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Status message state
  const [message, setMessage] = useState({ type: "", text: "" });

  const API_URL = "http://localhost:3000/api/coupons";

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setCoupons(res.data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setMessage({ type: "error", text: "Failed to load coupons." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !discountValue || !expiryDate) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    const couponData = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      usageLimit: Number(usageLimit) || 1, // Total uses
      maxUsagePerUser: Number(maxUsagePerUser) || 1, // Per user limit
      expiryDate,
      isActive
    };

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${isEditing}`, couponData);
        setMessage({ type: "success", text: "Coupon updated successfully!" });
      } else {
        await axios.post(API_URL, couponData);
        setMessage({ type: "success", text: "Coupon created successfully!" });
      }
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error("Save Error:", error);
      setMessage({ type: "error", text: error.response?.data?.message || "Error saving coupon." });
    }
  };

  const resetForm = () => {
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinOrderAmount(0);
    setMaxDiscount("");
    setUsageLimit(50);
    setMaxUsagePerUser(1);
    setExpiryDate("");
    setIsActive(true);
    setIsEditing(null);
    setShowForm(false);
  };

  const startEdit = (coupon) => {
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setMinOrderAmount(coupon.minOrderAmount);
    setMaxDiscount(coupon.maxDiscount || "");
    setUsageLimit(coupon.usageLimit);
    setMaxUsagePerUser(coupon.maxUsagePerUser || 1);
    setExpiryDate(new Date(coupon.expiryDate).toISOString().split("T")[0]);
    setIsActive(coupon.isActive);
    setIsEditing(coupon._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchCoupons();
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({ type: "error", text: "Failed to delete." });
    }
  };

  const toggleStatus = async (coupon) => {
    const newStatus = !coupon.isActive;
    try {
      await axios.put(`${API_URL}/${coupon._id}`, { ...coupon, isActive: newStatus });
      // Optimistic update
      setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: newStatus } : c));
    } catch (err) {
      console.error(err);
      fetchCoupons(); // fallback
    }
  };

  /* Stats Memo */
  const stats = useMemo(() => {
    const active = coupons.filter(c => c.isActive).length;
    const invalidated = coupons.filter(c => {
      const isDateExpired = new Date(c.expiryDate) < new Date();
      const isUsageComplete = c.usedCount >= c.usageLimit;
      return isDateExpired || isUsageComplete;
    }).length;
    return { total: coupons.length, active, invalidated };
  }, [coupons]);

  if (loading) return <div className="acp-root" style={{padding: '40px'}}>Loading Coupons...</div>;

  return (
    <div className="acp-root admin-content">
      {/* ── HEADER ────────────────────────────────── */}
      <header className="acp-header">
        <div>
          <h1 className="acp-header-title">Coupon <span>Management</span></h1>
          <p className="acp-header-sub">Create and monitor promotional discounts</p>
        </div>
        <button 
          className={`acp-add-btn ${showForm ? 'cancel' : ''}`} 
          onClick={() => { if(showForm) resetForm(); else setShowForm(true); }}
        >
          {showForm ? "✕ Close Form" : "+ Create New Coupon"}
        </button>
      </header>

      {/* ── NOTIFICATIONS ─────────────────────────── */}
      {message.text && (
        <div className={`acp-msg ${message.type}`}>
          <span>{message.text}</span>
          <button className="acp-msg-close" onClick={() => setMessage({ type: "", text: "" })}>✕</button>
        </div>
      )}

      {/* ── STATS ROW ─────────────────────────────── */}
      <div className="acp-stats-row">
        <div className="acp-stat-card">
          <p className="acp-stat-label">Total Coupons</p>
          <p className="acp-stat-value">{stats.total}</p>
        </div>
        <div className="acp-stat-card green">
          <p className="acp-stat-label">Active Now</p>
          <p className="acp-stat-value" style={{color: '#22c55e'}}>{stats.active}</p>
        </div>
        <div className="acp-stat-card orange">
          <p className="acp-stat-label">Expired / Inactive</p>
          <p className="acp-stat-value" style={{color: '#f59e0b'}}>{stats.total - stats.active}</p>
        </div>
        <div className="acp-stat-card">
          <p className="acp-stat-label">Invalid / Expired</p>
          <p className="acp-stat-value" style={{color: '#ff2e2e'}}>{stats.invalidated}</p>
        </div>
      </div>

      {/* ── ADD/EDIT FORM ─────────────────────────── */}
      {showForm && (
        <div className="acp-form-card">
          <h4 className="acp-form-title">
            {isEditing ? `✏️ Editing ${code}` : "🎫 Add New Coupon"}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="acp-form-grid">
              <div className="acp-field">
                <label>Coupon Code</label>
                <input 
                  className="acp-input" 
                  placeholder="e.g. SUMMER2024" 
                  value={code} 
                  onChange={e => setCode(e.target.value)} 
                  required 
                />
              </div>
              <div className="acp-field">
                <label>Discount Type</label>
                <select className="acp-input" value={discountType} onChange={e => setDiscountType(e.target.value)}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div className="acp-field">
                <label>Discount Value</label>
                <input 
                  type="number" 
                  className="acp-input" 
                  placeholder={discountType === 'percentage' ? "e.g. 20" : "e.g. 50"} 
                  value={discountValue} 
                  onChange={e => setDiscountValue(e.target.value)} 
                  required 
                />
              </div>
              <div className="acp-field">
                <label>Min Order Value ($)</label>
                <input 
                  type="number" 
                  className="acp-input" 
                  value={minOrderAmount} 
                  onChange={e => setMinOrderAmount(e.target.value)} 
                />
              </div>
              <div className="acp-field">
                <label>Max Discount ($)</label>
                <input 
                  type="number" 
                  className="acp-input" 
                  value={maxDiscount} 
                  onChange={e => setMaxDiscount(e.target.value)} 
                  disabled={discountType === 'fixed'}
                  placeholder={discountType === 'fixed' ? "N/A" : "0"}
                />
              </div>
              <div className="acp-field">
                <label>Max Users (Total)</label>
                <input 
                  type="number" 
                  className="acp-input" 
                  value={usageLimit} 
                  onChange={e => setUsageLimit(e.target.value)} 
                  required 
                />
              </div>
              <div className="acp-field">
                <label>Max Usage Per User</label>
                <input 
                  type="number" 
                  className="acp-input" 
                  value={maxUsagePerUser} 
                  onChange={e => setMaxUsagePerUser(e.target.value)} 
                  required 
                />
              </div>
              <div className="acp-field">
                <label>Expiry Date</label>
                <input 
                  type="date" 
                  className="acp-input" 
                  value={expiryDate} 
                  onChange={e => setExpiryDate(e.target.value)} 
                  required 
                />
              </div>
              <div className="acp-field">
                <label>Availability</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px'}}>
                  <label className="acp-switch">
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                    <span className="acp-slider"></span>
                  </label>
                  <span style={{color: isActive ? '#22c55e' : '#ef4444', fontSize: '13px', fontWeight: 'bold'}}>
                    {isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
              </div>
            </div>
            <div className="acp-form-actions">
              <button type="button" className="acp-btn-cancel" onClick={resetForm}>Cancel</button>
              <button type="submit" className="acp-btn-save">
                {isEditing ? "Update Coupon" : "Create Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TABLE ─────────────────────────────────── */}
      <div className="acp-table-wrap">
        <table className="acp-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Expiry</th>
              <th>Usage (Total)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => {
              const usedPercent = Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100);
              const isDateExpired = new Date(coupon.expiryDate) < new Date();
              const isUsageComplete = coupon.usedCount >= coupon.usageLimit;
              const isEffectivelyExpired = isDateExpired || isUsageComplete;
              
              return (
                <tr key={coupon._id}>
                  <td><span className="acp-code">{coupon.code}</span></td>
                  <td>
                    <div className="acp-discount">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                    </div>
                    {coupon.maxDiscount && coupon.discountType === 'percentage' && (
                      <div style={{fontSize: '11px', color: '#666'}}>Up to ${coupon.maxDiscount}</div>
                    )}
                  </td>
                  <td>${coupon.minOrderAmount}</td>
                  <td>
                    <div style={{color: isDateExpired ? '#ef4444' : '#ddd'}}>
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </div>
                    {isDateExpired && <div style={{fontSize: '10px', color: '#ef4444', fontWeight: 'bold'}}>DATE EXPIRED</div>}
                  </td>
                  <td>
                    <div className="acp-usage-bar-wrap">
                      <div className="acp-usage-text" style={{color: isUsageComplete ? '#ef4444' : '#888'}}>
                        {isUsageComplete ? "USAGE COMPLETE" : `Used: ${coupon.usedCount || 0} / ${coupon.usageLimit}`}
                      </div>
                      <div className="acp-usage-bar">
                        <div className="acp-usage-fill" style={{width: `${usedPercent}%`, background: isUsageComplete ? '#ef4444' : '#ff2e2e'}}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`acp-badge ${coupon.isActive ? 'active' : 'inactive'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="acp-actions">
                      <label className="acp-switch" title="Toggle Visibility">
                        <input type="checkbox" checked={coupon.isActive} onChange={() => toggleStatus(coupon)} />
                        <span className="acp-slider"></span>
                      </label>
                      <button className="acp-icon-btn edit" title="Edit" onClick={() => startEdit(coupon)}>✏️</button>
                      <button className="acp-icon-btn delete" title="Delete" onClick={() => handleDelete(coupon._id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <div className="acp-empty">
             <i className="bi bi-ticket-perforated"></i>
             <p>No coupons found. Start by creating a new promotional discount!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCouponsPage;