import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminMenuPage = () => {
  const { categoryTitle } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [categoryTitle]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/menu?categoryTitle=${categoryTitle}`
      );
      setItems(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price) return alert("Name and price required");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };

      if (editingId) {
        await axios.put(
          `http://localhost:3000/api/menu/${editingId}`,
          { name, price, desc, img },
          config
        );
      } else {
        await axios.post(
          "http://localhost:3000/api/menu/add-item",
          { name, price, desc, img, categoryTitle },
          config
        );
      }

      resetForm();
      fetchItems();
      setShowForm(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchItems();
    } catch (err) {
      console.log(err);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await axios.put(
        `http://localhost:3000/api/menu/${item._id}`,
        { ...item, isActive: !item.isActive },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchItems();
    } catch (err) {
      console.log(err);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setName(item.name);
    setPrice(item.price);
    setDesc(item.desc);
    setImg(item.img);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setDesc("");
    setImg("");
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-content">
      {/* HEADER SECTION */}
      <header className="menu-header">
        <div className="header-title">
          <h1>Menu Management</h1>
          <p>Manage your restaurant menu items, pricing, and availability</p>
        </div>
        <button className="btn-add-item" onClick={() => setShowForm(!showForm)}>
          <i className={`bi ${showForm ? "bi-dash-lg" : "bi-plus-lg"}`}></i>
          {showForm ? "Cancel Adding" : "Add New Menu Item"}
        </button>
      </header>

      {/* STATS ROW */}
      <section className="stats-row">
        <div className="stat-card">
          <div className="stat-card-top">
            <span>Total Items</span>
            <div className="dot blue"></div>
          </div>
          <div className="stat-value">{items.length}</div>
          <p className="stat-subtext text-up">+3 this week</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span>Available</span>
            <div className="dot green"></div>
          </div>
          <div className="stat-value">
            {items.filter(i => i.isActive !== false).length}
          </div>
          <p className="stat-subtext text-muted">87.5% active</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span>Out of Stock</span>
            <div className="dot red"></div>
          </div>
          <div className="stat-value">
            {items.filter(i => i.isActive === false).length}
          </div>
          <p className="stat-subtext text-warn">Needs attention</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span>Categories</span>
            <div className="dot orange"></div>
          </div>
          <div className="stat-value">8</div>
          <p className="stat-subtext text-muted">All active</p>
        </div>
      </section>

      {/* ADD/EDIT FORM (TOGGLE) */}
      {showForm && (
        <div className="admin-form-card mb-5">
          <h5 className="mb-4 text-white">
            {editingId ? "Update Existing Item" : "Create New Menu Entry"}
          </h5>
          <div className="row g-4">
            <div className="col-md-6">
              <label className="text-muted small mb-2 d-block">Item Name</label>
              <input
                className="form-control admin-input"
                placeholder="e.g. Double Cheese Deluxe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="text-muted small mb-2 d-block">Price (₹)</label>
              <input
                type="number"
                className="form-control admin-input"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="text-muted small mb-2 d-block">Image URL</label>
              <input
                className="form-control admin-input"
                placeholder="https://..."
                value={img}
                onChange={(e) => setImg(e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="text-muted small mb-2 d-block">Description</label>
              <textarea
                className="form-control admin-input"
                rows="3"
                placeholder="What makes this item special?"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="col-12">
              <button className="btn btn-add-item px-5" onClick={handleSubmit}>
                {editingId ? "Save Changes" : "Confirm & Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTER ROW */}
      <section className="filter-row">
        <div className="filter-left">
          <button className="btn-filter active" onClick={() => navigate("/admin/menu")}>
            <i className="bi bi-arrow-left"></i>
            Back to Categories
          </button>
          <button className="btn-filter">
            <i className="bi bi-sliders"></i>
            Filter Options
          </button>
        </div>

        <div className="filter-right">
          <label>Sort by:</label>
          <select className="sort-select">
            <option>Most Popular</option>
            <option>Newest</option>
            <option>Price: Low to High</option>
          </select>
        </div>
      </section>

      {/* ITEM GRID */}
      <div className="menu-grid">
        {filteredItems.length === 0 ? (
          <div className="text-center py-5 col-12">
            <p className="text-muted">No dishes found in {decodeURIComponent(categoryTitle)}.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div className="menu-card" key={item._id}>
              <div className="card-img-box">
                <img src={item.img} alt={item.name} />
                <div className="badge-overlay">
                  {decodeURIComponent(categoryTitle)}
                </div>
                
                {/* HOVER OVERLAY (CIRCULAR REVEAL) */}
                <div className="card-hover-overlay">
                  <p className="hover-desc">
                    {item.desc || "Experience the pure joy of our chef's special preparation using only the finest local ingredients for a truly unforgettable taste."}
                  </p>
                  
                  <div className="hover-actions">
                    <button 
                      className="btn-edit-cat" 
                      onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                    >
                      <i className="bi bi-pencil-square"></i> Edit Item
                    </button>
                    <button 
                      className="btn-delete-cat" 
                      onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                    >
                      <i className="bi bi-trash3"></i> Delete
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-info">
                <h3>{item.name}</h3>
                <div className="card-price">₹{item.price}</div>

                <div className="card-footer">
                  <div className="card-footer-actions">
                    <div className="availability-wrap">
                      <span>Availability</span>
                      <div className={`status-pill ${item.isActive !== false ? "available" : "out"}`}>
                        <i className="bi bi-circle-fill"></i>
                        {item.isActive !== false ? "Available" : "Out of Stock"}
                      </div>
                    </div>

                    <div className="d-flex align-items-center">
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={item.isActive !== false} 
                          onChange={() => toggleAvailability(item)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  {/* Quick View Button */}
                  <button
                    className="admin-action-btn secondary"
                    onClick={() => setViewItem(item)}
                    style={{ marginTop: '8px' }}
                  >
                    <i className="bi bi-eye"></i> View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAIL SIDEBAR DRAWER (RIGHT) */}
      {viewItem && (
        <div 
          className="admin-detail-drawer-overlay"
          onClick={() => setViewItem(null)}
        >
          <div 
            className="admin-detail-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Close Icon */}
            <div className="drawer-header">
              <button 
                className="drawer-close-btn"
                onClick={() => setViewItem(null)}
                title="Close sidebar"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Body */}
            <div className="drawer-body">
              <div className="drawer-img-wrapper">
                <img src={viewItem.img} alt={viewItem.name} />
              </div>

              <div className="drawer-meta">
                <span className="drawer-category-badge">
                  {decodeURIComponent(categoryTitle)}
                </span>
                <p className="drawer-price-tag">₹{viewItem.price}</p>
              </div>

              <h2 className="drawer-title">{viewItem.name}</h2>
              
              <div className="drawer-content-section">
                <span className="drawer-section-label">Detailed Description</span>
                <p className="drawer-description" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {viewItem.desc || "No special description provided for this item. It is prepared with our signature quality and fresh ingredients to ensure the best taste experience for our customers."}
                </p>
              </div>
            </div>

            {/* Fixed Bottom Actions */}
            <div className="drawer-actions-fixed">
              <button 
                className="btn btn-danger w-100 py-3 fw-bold rounded-4 shadow-sm"
                onClick={() => {
                  setViewItem(null);
                  startEdit(viewItem);
                }}
              >
                <i className="bi bi-pencil-square me-2"></i>
                Edit Item Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuPage;