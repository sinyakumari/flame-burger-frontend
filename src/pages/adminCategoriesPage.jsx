import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/authContext";
import "../styles/admin.css";

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(null);

  const navigate = useNavigate();

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const { token } = useAuth();

  const activeCategories = categories.filter(cat => cat.isActive).length;
  const totalItems = menuItems.length;
  const avgItems = categories.length > 0 ? (totalItems / categories.length).toFixed(1) : 0;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, menuRes] = await Promise.all([
        axios.get("http://localhost:3000/api/categories"),
        axios.get("http://localhost:3000/api/menu")
      ]);
      setCategories(catRes.data);
      setMenuItems(menuRes.data);
    } catch (error) {
      console.error("Error fetching category data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (image) formData.append("image", image);

    try {
      if (isEditing) {
        await axios.put(`http://localhost:3000/api/categories/${isEditing}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await axios.post("http://localhost:3000/api/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImage(null);
    setIsEditing(null);
    setShowForm(false);
  };

  const startEdit = (cat) => {
    setTitle(cat.title);
    setDescription(cat.description || "");
    setIsEditing(cat._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:3000/api/categories/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const toggleStatus = async (cat) => {
    try {
      await axios.put(`http://localhost:3000/api/categories/${cat._id}`, {
        isActive: !cat.isActive
      });
      fetchData();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };


  if (loading) return <div className="p-5 text-white">Loading Dashboard...</div>;

  return (
    <div className="container-fluid py-4 min-vh-100">
      
      {/* HEADER */}
      <div className="category-header-legacy">
        <div className="header-title text-white">
          <h1>Categories</h1>
          <p>Organize and manage your menu categories and food types</p>
        </div>
        <button className="btn-add-item" onClick={() => setShowForm(!showForm)}>
          <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
          {showForm ? "Close Form" : "Add New Category"}
        </button>
      </div>

      {/* ADD/EDIT FORM */}
      {showForm && (
        <div className="admin-form-card mb-5">
          <h4 className="text-white mb-4">{isEditing ? "Edit Category" : "Create Category"}</h4>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="text-muted mb-2">Category Title</label>
                <input 
                  type="text" 
                  className="form-control admin-input" 
                  placeholder="e.g. Burgers, Sides"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="text-muted mb-2">Category Image</label>
                <input 
                  type="file" 
                  className="form-control admin-input"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>
              <div className="col-12">
                <label className="text-muted mb-2">Description</label>
                <textarea 
                  className="form-control admin-input"
                  rows="3"
                  placeholder="Describe this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="col-12 mt-4">
                <button type="submit" className="btn-add-item border-0">
                  {isEditing ? "Update Category" : "Save Category"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* STATS ROW */}
      <div className="category-stats-row">
        <div className="category-stat-card">
          <div className="stat-label">
            <span>Total Categories</span>
            <div className="dot blue"></div>
          </div>
          <div className="stat-value text-white">{categories.length}</div>
          <div className="stat-sub text-up">+1 this month</div>
        </div>
        <div className="category-stat-card">
          <div className="stat-label">
            <span>Active</span>
            <div className="dot green"></div>
          </div>
          <div className="stat-value text-white">{activeCategories}</div>
          <div className="stat-sub text-muted">{((activeCategories/categories.length || 1)*100).toFixed(0)}% active</div>
        </div>
        <div className="category-stat-card">
          <div className="stat-label">
            <span>Total Items</span>
            <div className="dot red"></div>
          </div>
          <div className="stat-value text-white">{totalItems}</div>
          <div className="stat-sub text-muted">Across all categories</div>
        </div>
        <div className="category-stat-card">
          <div className="stat-label">
            <span>Average Items</span>
            <div className="dot orange"></div>
          </div>
          <div className="stat-value text-white">{avgItems}</div>
          <div className="stat-sub text-muted">Per category</div>
        </div>
      </div>

<<<<<<< HEAD
      {/* CATEGORY CARDS */}
      <div className="row">
        {categories.length === 0 ? (
          <p className="text-white">No categories found.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat._id} className="col-md-6 col-lg-4 mb-4">
              <div className="category-card p-0">
                
                {/* Image Section - Reference Style */}
                <div className="category-card-img-wrapper">
                  {cat.image ? (
                    <img 
                      src={cat.image} 
                      alt={cat.title} 
                      className="category-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('no-image');
                      }}
                    />
                  ) : (
                    <div className="no-image-placeholder">🍔</div>
                  )}
                  {/* Status Badge Over-image or Next to title */}
                  <span className={`category-status-pill ${cat.isActive ? "active" : "hidden"}`}>
                    {cat.isActive ? "Active" : "Hidden"}
                  </span>
                </div>

                {/* Info Section */}
                <div className="category-card-info">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="category-card-name">{cat.title}</h5>
                    <button
                      className="category-delete-icon"
                      onClick={() => deleteCategory(cat._id)}
                      title="Delete Category"
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>
                  
                  <p className="category-card-subtitle">
                    Manage all menu items for {cat.title.toLowerCase()}
                  </p>

                  <div className="category-card-footer">
                    <button
                      className="btn-view-items"
                      onClick={() => navigate(`/admin/menu/${cat.title}`)}
                    >
                      View Items <i className="bi bi-chevron-right ms-1"></i>
                    </button>
                  </div>
                </div>
                
              </div>
            </div>
          ))
        )}
=======
      {/* FILTERS */}
      <div className="filter-row mb-4">
        <div className="filter-left">
          <button className="btn-filter active">
            <i className="bi bi-funnel"></i> All Status
          </button>
          <button className="btn-filter">
            <i className="bi bi-grid-3x3-gap"></i> View Options
          </button>
        </div>
        <div className="filter-right">
          <label>Sort by:</label>
          <select className="sort-select">
            <option>Most Items</option>
            <option>Recently Added</option>
          </select>
        </div>
>>>>>>> dev
      </div>

      {/* CATEGORY GRID */}
      <div className="cat-grid">
        {categories.map((cat) => {
          // Correctly filter items by checking the populated category title
          const catItemCount = menuItems.filter(item => 
            item.category && (item.category.title === cat.title || item.category === cat._id)
          ).length;
          return (
            <div className="cat-card" key={cat._id}>
              {/* NORMAL STATE - Clickable Area */}
              <div className="cat-clickable-area" onClick={() => navigate(`/admin/menu/${encodeURIComponent(cat.title)}`)}>
                <div className="cat-card-img">
                  <img 
                    src={cat.image || "/placeholder-cat.jpg"} 
                    alt={cat.title} 
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop"; }}
                  />
                  <div className="items-badge">
                     {catItemCount} items
                  </div>
                </div>

                <div className="cat-info text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h3>{cat.title}</h3>
                    <div className={`cat-active-pill ${!cat.isActive ? 'inactive' : ''}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>

              {/* TOGGLE - Outside clickable area to prevent navigation */}
              <div className="cat-toggle-fixed">
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={cat.isActive} 
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleStatus(cat);
                    }}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* HOVER REVEAL EFFECT */}
              <div className="cat-hover-reveal">
                <p className="cat-hover-desc">
                  {cat.description || `Explore our delicious selection of ${cat.title}. Freshly prepared with high-quality ingredients for the best taste experience.`}
                </p>
                <div className="cat-hover-actions-stack">
                  <button 
                    className="btn-cat-view" 
                    onClick={() => navigate(`/admin/menu/${encodeURIComponent(cat.title)}`)}
                  >
                    <i className="bi bi-eye"></i> View Category Items
                  </button>
                  <div className="cat-hover-actions">
                    <button className="btn-edit-cat" onClick={(e) => { e.stopPropagation(); startEdit(cat); }}>
                      <i className="bi bi-pencil-square"></i> Edit Category
                    </button>
                    <button className="btn-delete-cat" onClick={(e) => { e.stopPropagation(); handleDelete(cat._id); }}>
                      <i className="bi bi-trash3"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminCategoriesPage;