import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const AdminMenuPage = () => {
  const { categoryTitle } = useParams();

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [viewItem, setViewItem] = useState(null); // ✅ NEW: For Quick View

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
          {
            name,
            price,
            desc,
            img,
            categoryTitle
          },
          config
        );
      }

      resetForm();
      fetchItems();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await axios.delete(
        `http://localhost:3000/api/menu/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setDesc("");
    setImg("");
  };

  return (
    <div className="admin-content-wrapper p-4">      {/* ================= CATEGORY HEADER ================= */}
      <div className="admin-item-header mb-5">
        <button 
          className="btn-back-square me-4"
          onClick={() => window.history.back()}
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <div>
          <h1 className="admin-page-title m-0">
            {decodeURIComponent(categoryTitle)}
          </h1>
          <span className="admin-item-count">
            {items.length} Total Items
          </span>
        </div>
      </div>

      {/* ================= GLASSMORPHIC FORM ================= */}
      <div className="admin-form-card mb-5">
        <h5 className="mb-4 text-white d-flex align-items-center">
          <i className={`bi ${editingId ? 'bi-pencil-stars' : 'bi-plus-circle'} me-3 text-danger fs-4`}></i>
          {editingId ? "Edit Menu Item" : "Create New Item"}
        </h5>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="text-muted small mb-1">Item Name</label>
            <input
              className="form-control admin-input"
              placeholder="e.g. Classic Flame Burger"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="text-muted small mb-1">Price (₹)</label>
            <input
              type="number"
              className="form-control admin-input"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="col-12 mt-3">
            <label className="text-muted small mb-1">Image URL</label>
            <input
              className="form-control admin-input"
              placeholder="https://images.unsplash.com/..."
              value={img}
              onChange={(e) => setImg(e.target.value)}
            />
          </div>

          <div className="col-12 mt-3">
            <label className="text-muted small mb-1">Description</label>
            <textarea
              className="form-control admin-input"
              placeholder="Describe the taste, ingredients, etc."
              rows="3"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="col-12 mt-4">
            <button
              className="btn btn-danger btn-add-item me-3"
              onClick={handleSubmit}
            >
              {editingId ? "Update Item" : "Create Item"}
            </button>

            {editingId && (
              <button
                className="btn btn-outline-secondary rounded-3 px-4"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= ITEMS GRID (RESTORED USABILITY) ================= */}
      <div className="row">
        {items.length === 0 ? (
          <div className="col-12 text-center py-5">
            <p className="text-muted">No items found in this category.</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div className="col-md-6 col-lg-4 mb-4" key={item._id}>
              <div 
                className="menu-item-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                
                {/* Image Section */}
                <div className="menu-card-img-wrapper">
                  <img 
                    src={item.img} 
                    alt={item.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150?text=Food";
                    }}
                  />
                </div>

                {/* Details Section */}
                <h5 className="menu-item-name">{item.name}</h5>
                <p className="menu-item-info">
                  {decodeURIComponent(categoryTitle)}
                </p>
                <p className="menu-item-price">₹{item.price}</p>

                {/* Action Section - Labeled for Clarity */}
                <div className="menu-action-stack">
                  <div className="d-flex gap-2">
                    <button
                      className="admin-action-btn edit"
                      onClick={() => startEdit(item)}
                    >
                      <i className="bi bi-pencil-square"></i> Edit
                    </button>

                    <button
                      className="admin-action-btn delete"
                      onClick={() => handleDelete(item._id)}
                    >
                      <i className="bi bi-trash3"></i> Delete
                    </button>
                  </div>

                  <button
                    className="admin-action-btn secondary"
                    onClick={() => setViewItem(item)}
                  >
                    <i className="bi bi-eye"></i> View details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= DETAIL SIDEBAR DRAWER (RIGHT) ================= */}
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

            {/* Scrollable Body */}
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