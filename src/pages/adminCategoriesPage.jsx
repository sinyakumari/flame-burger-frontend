import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/authContext";
import "../styles/admin.css";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(null);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageMode, setImageMode] = useState("file"); // "file" or "url"

  // Filter & View States
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
  const [sortBy, setSortBy] = useState("Most Items");

  const navigate = useNavigate();
  const { token } = useAuth();

  const activeCategories = categories.filter((cat) => cat.isActive !== false).length;
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
        axios.get("http://localhost:3000/api/menu"),
      ]);
      setCategories(catRes.data);
      setMenuItems(menuRes.data);
    } catch (error) {
      console.error("Error fetching category data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageStr) => {
    if (!imageStr) return "/placeholder-cat.jpg";
    if (imageStr.includes("uploads/http")) {
      return imageStr.substring(imageStr.indexOf("http", 10));
    }
    return imageStr;
  };

  const getCatItemCount = (cat) => {
    return menuItems.filter(
      (item) => item.category && (item.category.title === cat.title || item.category === cat._id)
    ).length;
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImageUrl("");
    }
  };

  const handleImageUrlChange = (e) => {
    const val = e.target.value;
    setImageUrl(val);
    setImagePreview(val);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("isActive", isActive);

    if (imageMode === "file" && imageFile) {
      formData.append("image", imageFile);
    } else if (imageMode === "url" && imageUrl) {
      formData.append("image", imageUrl); // maps into req.body.image
    }

    try {
      if (isEditing) {
        await axios.put(`http://localhost:3000/api/categories/${isEditing}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("http://localhost:3000/api/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
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
    setImageFile(null);
    setImageUrl("");
    setImagePreview("");
    setIsActive(true);
    setIsEditing(null);
    setShowForm(false);
  };

  const startEdit = (cat) => {
    setTitle(cat.title);
    setDescription(cat.description || "");
    setIsActive(cat.isActive !== false);
    setIsEditing(cat._id);

    const sanitizedUrl = getImageUrl(cat.image);
    if (sanitizedUrl && sanitizedUrl.startsWith("http") && !sanitizedUrl.includes("localhost:3000/uploads/")) {
      setImageMode("url");
      setImageUrl(sanitizedUrl);
      setImageFile(null);
      setImagePreview(sanitizedUrl);
    } else {
      setImageMode("file");
      setImageUrl("");
      setImageFile(null);
      setImagePreview(sanitizedUrl !== "/placeholder-cat.jpg" ? sanitizedUrl : "");
    }

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      const newStatus = cat.isActive === false ? true : false;
      await axios.put(`http://localhost:3000/api/categories/${cat._id}`, {
        isActive: newStatus,
      });
      fetchData();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  // Filter & Sort Logic
  let filteredCategories = categories.filter((cat) => {
    if (filterStatus === "Available") return cat.isActive !== false;
    if (filterStatus === "Unavailable") return cat.isActive === false;
    return true; // "All"
  });

  if (sortBy === "Most Items") {
    filteredCategories.sort((a, b) => getCatItemCount(b) - getCatItemCount(a));
  } else if (sortBy === "Recently Added") {
    filteredCategories.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  if (loading) return <div className="p-5" style={{color: '#888'}}>Loading Categories...</div>;

  return (
    <div>
      {/* HEADER */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px'}}>
        <div>
          <h2 className="dashboard-title" style={{color: '#ff2e2e', fontWeight: '700', margin: 0}}>Categories</h2>
          <p style={{color: '#888', margin: '5px 0 0 0', fontSize: '14px'}}>Organize and manage your menu categories and food types</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={{background: showForm ? '#333' : '#ff2e2e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', transition: '0.3s', cursor: 'pointer'}}
        >
          {showForm ? "Cancel" : "+ Add New Category"}
        </button>
      </div>

      {/* ADD/EDIT FORM MODAL/PANEL */}
      {showForm && (
        <div style={{background: '#111', border: '1px solid #1f1f1f', borderRadius: '16px', padding: '24px', marginBottom: '30px'}}>
          <h4 style={{color: '#fff', marginBottom: '20px'}}>{isEditing ? "Edit Category" : "Create Category"}</h4>
          <form onSubmit={handleSubmit}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
              {/* Left Column */}
              <div>
                <div style={{marginBottom: '15px'}}>
                  <label style={{color: '#888', display: 'block', marginBottom: '8px', fontSize: '13px'}}>Category Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Burgers, Sides"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{width: '100%', background: '#0a0a0a', border: '1px solid #222', color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none'}}
                  />
                </div>

                <div style={{marginBottom: '15px'}}>
                  <label style={{color: '#888', display: 'block', marginBottom: '8px', fontSize: '13px'}}>Description</label>
                  <textarea 
                    rows="4"
                    placeholder="Describe this category..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{width: '100%', background: '#0a0a0a', border: '1px solid #222', color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none'}}
                  ></textarea>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px', background: '#0a0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #222'}}>
                  <label style={{color: '#888', fontSize: '13px', margin: 0}}>Availability:</label>
                  <label className="switch" style={{margin: 0}}>
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    <span className="slider" style={{borderRadius: '34px'}}></span>
                  </label>
                  <span style={{color: isActive ? '#22c55e' : '#ef4444', fontWeight: 'bold', fontSize: '13px'}}>
                    {isActive ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <label style={{color: '#888', display: 'block', marginBottom: '8px', fontSize: '13px'}}>Category Image</label>
                
                <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                  <button 
                    type="button" 
                    onClick={() => setImageMode("file")}
                    style={{flex: 1, padding: '8px', background: imageMode === "file" ? '#ff2e2e' : '#222', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: '0.2s'}}
                  >
                    Upload File
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setImageMode("url")}
                    style={{flex: 1, padding: '8px', background: imageMode === "url" ? '#ff2e2e' : '#222', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: '0.2s'}}
                  >
                    Image URL
                  </button>
                </div>

                {imageMode === "file" ? (
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{width: '100%', background: '#0a0a0a', border: '1px solid #222', color: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px'}}
                  />
                ) : (
                  <input 
                    type="url" 
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    style={{width: '100%', background: '#0a0a0a', border: '1px solid #222', color: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '15px', outline: 'none', fontSize: '13px'}}
                  />
                )}

                {imagePreview && (
                  <div style={{marginTop: '10px', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden', height: '180px', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <img src={imagePreview} alt="Preview" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>
            </div>

            <div style={{marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid #1f1f1f', paddingTop: '20px'}}>
              <button type="button" onClick={() => setShowForm(false)} style={{padding: '10px 20px', background: 'transparent', border: '1px solid #333', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500'}}>
                Cancel
              </button>
              <button type="submit" style={{padding: '10px 25px', background: '#ff2e2e', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 14px rgba(255, 46, 46, 0.4)'}}>
                {isEditing ? "Update Category" : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STATS ROW */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px'}}>
        <div style={{background: '#1e1e1e', border: '1px solid #282828', borderLeft: '3px solid #ff2e2e', padding: '20px', borderRadius: '16px', transition: 'box-shadow 0.2s'}}>
          <div style={{fontSize: '11px', color: '#999', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500'}}>Total Categories</div>
          <div style={{fontSize: '30px', fontWeight: '800', color: '#e8e8e8', lineHeight: 1, letterSpacing: '-0.5px'}}>{categories.length}</div>
        </div>
        <div style={{background: '#1e1e1e', border: '1px solid #282828', borderLeft: '3px solid #22c55e', padding: '20px', borderRadius: '16px', transition: 'box-shadow 0.2s'}}>
          <div style={{fontSize: '11px', color: '#999', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500'}}>Available</div>
          <div style={{fontSize: '30px', fontWeight: '800', color: '#22c55e', lineHeight: 1, letterSpacing: '-0.5px'}}>{activeCategories}</div>
        </div>
        <div style={{background: '#1e1e1e', border: '1px solid #282828', borderLeft: '3px solid #ff2e2e', padding: '20px', borderRadius: '16px', transition: 'box-shadow 0.2s'}}>
          <div style={{fontSize: '11px', color: '#999', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500'}}>Total Menu Items</div>
          <div style={{fontSize: '30px', fontWeight: '800', color: '#e8e8e8', lineHeight: 1, letterSpacing: '-0.5px'}}>{totalItems}</div>
        </div>
        <div style={{background: '#1e1e1e', border: '1px solid #282828', borderLeft: '3px solid #ff2e2e', padding: '20px', borderRadius: '16px', transition: 'box-shadow 0.2s'}}>
          <div style={{fontSize: '11px', color: '#999', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500'}}>Avg. Items/Category</div>
          <div style={{fontSize: '30px', fontWeight: '800', color: '#ff2e2e', lineHeight: 1, letterSpacing: '-0.5px'}}>{avgItems}</div>
        </div>
      </div>

      {/* FILTER & VIEW TOGGLES */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#111', padding: '15px 20px', borderRadius: '12px', border: '1px solid #1f1f1f', flexWrap: 'wrap', gap: '15px'}}>
        <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
          {/* Status Filter Dropdown */}
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{background: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', outline: 'none', fontSize: '13px'}}
          >
            <option value="All">All Status</option>
            <option value="Available">Available Only</option>
            <option value="Unavailable">Unavailable Only</option>
          </select>

          {/* View Options Toggle */}
          <div style={{display: 'flex', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden'}}>
            <button 
              onClick={() => setViewMode("grid")}
              style={{background: viewMode === "grid" ? '#ff2e2e' : 'transparent', color: viewMode === "grid" ? '#fff' : '#888', border: 'none', padding: '10px 20px', cursor: 'pointer', fontSize: '13px', fontWeight: viewMode === "grid" ? 'bold' : 'normal', transition: '0.2s'}}
            >
              Grid View
            </button>
            <button 
              onClick={() => setViewMode("table")}
              style={{background: viewMode === "table" ? '#ff2e2e' : 'transparent', color: viewMode === "table" ? '#fff' : '#888', border: 'none', padding: '10px 20px', cursor: 'pointer', fontSize: '13px', fontWeight: viewMode === "table" ? 'bold' : 'normal', transition: '0.2s'}}
            >
              Table View
            </button>
          </div>
        </div>

        <div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{background: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', outline: 'none', fontSize: '13px'}}
          >
            <option value="Most Items">Sort: Most Items</option>
            <option value="Recently Added">Sort: Recently Added</option>
          </select>
        </div>
      </div>

      {/* DATA DISPLAY */}
      {viewMode === "grid" ? (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px'}}>
          {filteredCategories.map((cat) => {
            const count = getCatItemCount(cat);
            const isAvail = cat.isActive !== false;
            return (
              <div key={cat._id} style={{background: '#111', border: '1px solid #1f1f1f', borderRadius: '16px', overflow: 'hidden', position: 'relative', transition: '0.3s', display: 'flex', flexDirection: 'column'}}>
                <div style={{height: '180px', width: '100%', overflow: 'hidden', position: 'relative', cursor: 'pointer'}} onClick={() => navigate(`/admin/menu/${encodeURIComponent(cat.title)}`)}>
                  <img 
                    src={getImageUrl(cat.image)} 
                    alt={cat.title} 
                    style={{width: '100%', height: '100%', objectFit: 'cover', opacity: isAvail ? 1 : 0.4, transition: 'transform 0.5s ease'}}
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop"; }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  <div style={{position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)'}}>
                    {count} Items
                  </div>
                  {!isAvail && (
                     <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'}}>
                       Unavailable
                     </div>
                  )}
                </div>

                <div style={{padding: '20px', flexGrow: 1}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px'}}>
                    <h3 style={{color: '#fff', margin: 0, fontSize: '18px', fontWeight: '600', cursor: 'pointer'}} onClick={() => navigate(`/admin/menu/${encodeURIComponent(cat.title)}`)}>{cat.title}</h3>
                    <label className="switch" style={{margin: 0, transform: 'scale(0.8)'}} title="Toggle Availability">
                      <input type="checkbox" checked={isAvail} onChange={() => toggleStatus(cat)} />
                      <span className="slider" style={{borderRadius: '34px'}}></span>
                    </label>
                  </div>
                  <p style={{color: '#888', fontSize: '13px', margin: 0, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                    {cat.description || "No description available for this category."}
                  </p>
                </div>

                <div style={{borderTop: '1px solid #1f1f1f', padding: '15px 20px', display: 'flex', gap: '10px', background: '#0a0a0a'}}>
                  <button onClick={() => startEdit(cat)} style={{flex: 1, background: '#222', color: '#fff', border: '1px solid #333', padding: '8px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', transition: '0.2s', fontWeight: '500'}} onMouseOver={(e) => e.target.style.background='#333'} onMouseOut={(e) => e.target.style.background='#222'}>
                    Edit Content
                  </button>
                  <button onClick={() => handleDelete(cat._id)} style={{background: 'rgba(255, 46, 46, 0.1)', color: '#ff2e2e', border: '1px solid rgba(255, 46, 46, 0.2)', padding: '8px 15px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', transition: '0.2s', fontWeight: '500'}} onMouseOver={(e) => e.target.style.background='rgba(255, 46, 46, 0.2)'} onMouseOut={(e) => e.target.style.background='rgba(255, 46, 46, 0.1)'}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{background: '#111', border: '1px solid #1f1f1f', borderRadius: '16px', overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#fff'}}>
            <thead>
              <tr style={{borderBottom: '1px solid #222', color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                <th style={{padding: '20px'}}>Image</th>
                <th style={{padding: '20px'}}>Title</th>
                <th style={{padding: '20px'}}>Description</th>
                <th style={{padding: '20px'}}>Items</th>
                <th style={{padding: '20px'}}>Status</th>
                <th style={{padding: '20px', textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(cat => {
                const count = getCatItemCount(cat);
                const isAvail = cat.isActive !== false;
                return (
                  <tr key={cat._id} style={{borderBottom: '1px solid #1f1f1f', transition: '0.2s'}} onMouseOver={(e) => e.currentTarget.style.background='#1a1a1a'} onMouseOut={(e) => e.currentTarget.style.background='transparent'}>
                    <td style={{padding: '15px 20px'}}>
                      <img src={getImageUrl(cat.image)} alt={cat.title} style={{width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #222', opacity: isAvail ? 1 : 0.5}} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop"; }} />
                    </td>
                    <td style={{padding: '15px 20px', fontWeight: '600', fontSize: '15px'}}>{cat.title}</td>
                    <td style={{padding: '15px 20px', color: '#888', fontSize: '13px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {cat.description || "-"}
                    </td>
                    <td style={{padding: '15px 20px', fontSize: '14px'}}>{count}</td>
                    <td style={{padding: '15px 20px'}}>
                      <label className="switch" style={{margin: 0, transform: 'scale(0.8)'}} title="Toggle Availability">
                        <input type="checkbox" checked={isAvail} onChange={() => toggleStatus(cat)} />
                        <span className="slider" style={{borderRadius: '34px'}}></span>
                      </label>
                    </td>
                    <td style={{padding: '15px 20px', textAlign: 'right'}}>
                      <button onClick={() => startEdit(cat)} style={{background: '#222', color: '#fff', border: '1px solid #333', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', marginRight: '8px', transition: '0.2s'}}>Edit</button>
                      <button onClick={() => handleDelete(cat._id)} style={{background: 'rgba(255, 46, 46, 0.1)', color: '#ff2e2e', border: '1px solid rgba(255, 46, 46, 0.2)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', transition: '0.2s'}}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCategories.length === 0 && <div style={{padding: '50px', textAlign: 'center', color: '#888'}}>No categories found matching your filters.</div>}
        </div>
      )}
    </div>
  );
}