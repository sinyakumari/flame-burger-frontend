import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!title.trim()) return;

    try {
      await fetch("http://localhost:3000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      setTitle("");
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/categories/${id}`, {
        method: "DELETE",
      });

      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  if (loading) return <p className="text-white mt-4">Loading...</p>;

  return (
    <div className="container-fluid admin-menu-page">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="admin-title">Manage Categories</h2>

        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control bg-dark text-white border-secondary"
            placeholder="New Category"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn btn-danger" onClick={addCategory}>
            Add
          </button>
        </div>
      </div>

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
      </div>

    </div>
  );
}

export default AdminCategoriesPage;