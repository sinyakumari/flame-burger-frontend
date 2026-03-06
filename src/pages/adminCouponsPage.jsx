import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/admin.css";

function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(null);

  // Form States
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState(1);
  const [expiryDate, setExpiryDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Status message state
  const [message, setMessage] = useState({ type: "", text: "" });

  // Base URL for API
  const API_URL = "/api/coupons";

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
      setMessage({ type: "error", text: "Failed to load coupons. Check console for details." });
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
      discountType: discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      usageLimit: Number(usageLimit) || 1,
      expiryDate: expiryDate,
      isActive: isActive
    };

    console.log("📤 SENDING V8.0 DATA:", couponData);

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${isEditing}`, couponData);
        setMessage({ type: "success", text: "Coupon updated successfully! 🎉" });
      } else {
        await axios.post(API_URL, couponData);
        setMessage({ type: "success", text: "Coupon created successfully! 🎫" });
      }
      
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error("❌ SAVE ERROR:", error);
      const errorMsg = error.response?.data?.message || "Error saving coupon. Check if Backend is running.";
      setMessage({ type: "error", text: errorMsg });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const resetForm = () => {
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinOrderAmount(0);
    setMaxDiscount("");
    setUsageLimit(1);
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
    setExpiryDate(new Date(coupon.expiryDate).toISOString().split("T")[0]);
    setIsActive(coupon.isActive);
    setIsEditing(coupon._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchCoupons();
      } catch (error) {
        console.error("Error deleting coupon:", error);
        setMessage({ type: "error", text: "Failed to delete coupon." });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    }
  };

  if (loading) return <div className="p-5 text-white">Loading Coupons...</div>;

  return (
    <div className="container-fluid py-4 min-vh-100">
      <div className="category-header-legacy">
        <div className="header-title text-white">
          <h1>Coupons</h1>
          <p>Manage discounts and promotional codes</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn-add-item" onClick={() => setShowForm(!showForm)}>
            <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
            {showForm ? "Close Form" : "Create New Coupon"}
          </button>
        </div>
      </div>

      {/* STATUS NOTIFICATION */}
      {message.text && (
        <div 
          className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4 d-flex justify-content-between align-items-center shadow-sm`}
          style={{ borderRadius: '12px', padding: '15px 20px', border: 'none' }}
        >
          <div className="d-flex align-items-center">
            {message.type === 'success' ? (
              <i className="bi bi-check-circle-fill me-2 fs-5 text-success"></i>
            ) : (
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5 text-danger"></i>
            )}
            <span className="fw-bold">{message.text}</span>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMessage({ type: "", text: "" })}
            aria-label="Close"
          ></button>
        </div>
      )}

      {showForm && (
        <div className="admin-form-card mb-5 shadow-lg border-0" style={{ backgroundColor: '#2a2a2a', borderRadius: '15px' }}>
          <h4 className="text-white mb-4">{isEditing ? "Edit Coupon" : "Create Coupon"}</h4>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="text-muted small mb-2 uppercase">Coupon Code</label>
                <input 
                  type="text" 
                  className="form-control admin-input" 
                  placeholder="e.g. SAVE50"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="text-muted small mb-2">Discount Type</label>
                <select 
                  className="form-control admin-input"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="text-muted small mb-2">Discount Value</label>
                <input 
                  type="number" 
                  className="form-control admin-input" 
                  placeholder="e.g. 10 or 500"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="text-muted small mb-2">Min Order Amount (₹)</label>
                <input 
                  type="number" 
                  className="form-control admin-input" 
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="text-muted small mb-2">Max Discount (₹, for % only)</label>
                <input 
                  type="number" 
                  className="form-control admin-input" 
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  disabled={discountType === 'fixed'}
                />
              </div>
              <div className="col-md-4">
                <label className="text-muted small mb-2">Usage Limit</label>
                <input 
                  type="number" 
                  className="form-control admin-input" 
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="text-muted small mb-2">Expiry Date</label>
                <input 
                  type="date" 
                  className="form-control admin-input" 
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="text-muted small mb-2">Status</label>
                <div className="form-check form-switch mt-2">
                  <input 
                    className="form-check-input custom-switch" 
                    type="checkbox" 
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <label className="form-check-label text-white ms-2">
                    {isActive ? "Active" : "Inactive"}
                  </label>
                </div>
              </div>
              <div className="col-12 mt-4 text-end">
                <button type="button" className="btn btn-outline-secondary px-4 me-3" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn-add-item border-0 px-5 py-2">
                  {isEditing ? "Update Coupon" : "Save Coupon"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* STATS SUMMARY */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="category-stat-card shadow-sm h-100">
            <div className="stat-label mb-2">
              <span className="text-muted">Total Coupons</span>
              <div className="dot blue"></div>
            </div>
            <div className="stat-value text-white h3 mb-0">{coupons.length}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="category-stat-card shadow-sm h-100">
            <div className="stat-label mb-2">
              <span className="text-muted">Active</span>
              <div className="dot green"></div>
            </div>
            <div className="stat-value text-white h3 mb-0">{coupons.filter(c => c.isActive).length}</div>
          </div>
        </div>
      </div>

      {/* COUPONS TABLE */}
      <div className="admin-table-container shadow-lg border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
        <table className="table admin-table text-white mb-0">
          <thead className="bg-darker">
            <tr>
              <th className="ps-4">Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Usage</th>
              <th>Expiry</th>
              <th>Status</th>
              <th className="pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td className="ps-4 fw-bold text-orange">{coupon.code}</td>
                <td>
                  <span className="d-block">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</span>
                  {coupon.maxDiscount && coupon.discountType === 'percentage' && <small className="text-muted">Up to ₹{coupon.maxDiscount}</small>}
                </td>
                <td>₹{coupon.minOrderAmount}</td>
                <td>
                   <div className="progress" style={{ height: '6px', width: '80px', backgroundColor: '#444' }}>
                      <div 
                        className="progress-bar bg-orange" 
                        style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                      ></div>
                   </div>
                   <small className="text-muted mt-1 d-block">{coupon.usedCount} / {coupon.usageLimit}</small>
                </td>
                <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                <td>
                  <span className={`badge rounded-pill ${coupon.isActive ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`} style={{ padding: '6px 12px' }}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="pe-4">
                  <div className="d-flex gap-2">
                    <button className="btn btn-action-edit" title="Edit" onClick={() => startEdit(coupon)}>
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="btn btn-action-delete" title="Delete" onClick={() => handleDelete(coupon._id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center p-5 text-muted">
                   <i className="bi bi-ticket-perforated d-block fs-1 mb-3"></i>
                   No coupons found. Create your first discount to boost sales!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminCouponsPage;