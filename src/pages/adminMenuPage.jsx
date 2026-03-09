import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./adminMenu.css";

/* ── helpers ─────────────────────────────────── */
const resolveImg = (src) => {
  if (!src) return null;
  if (src.startsWith("http") || src.startsWith("/uploads")) return src;
  if (src.startsWith("/assets/")) return `http://localhost:3000${src}`;
  return src;
};

/* ── sub-component: Item Drawer ──────────────── */
const MenuItemDrawer = ({ item, categoryTitle, onClose, onEdit, onToggle, onDelete }) => {
  if (!item) return null;
  const imgSrc = resolveImg(item.img);
  const isAvail = item.isActive !== false;

  return (
    <>
      <div className="mid-overlay" onClick={onClose} />
      <aside className="mid-panel">
        <header className="mid-header">
          <div>
            <h3 className="mid-title">{item.name}</h3>
            <p className="mid-category">{categoryTitle}</p>
          </div>
          <button className="mid-close" onClick={onClose}>✕</button>
        </header>

        <div className="mid-body">
          {/* Image */}
          <div className="mid-img-wrap">
            {imgSrc
              ? <img src={imgSrc} alt={item.name} className="mid-img"
                  onError={e => { e.target.style.display = "none"; e.target.nextElementSibling.style.display = "flex"; }} />
              : null}
            <div className="mid-img-placeholder" style={{ display: imgSrc ? "none" : "flex" }}>🍔</div>
            <div className={`mid-avail-badge ${isAvail ? "avail" : "unavail"}`}>
              {isAvail ? "✓ Available" : "✗ Unavailable"}
            </div>
          </div>

          {/* Price */}
          <div className="mid-price-row">
            <span className="mid-price">${parseFloat(item.price).toFixed(2)}</span>
            <div className="mid-toggle-wrap">
              <span className="mid-toggle-label">Availability</span>
              <label className="switch">
                <input type="checkbox" checked={isAvail} onChange={() => onToggle(item)} />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="mid-section">
            <h4 className="mid-section-title">Description</h4>
            <p className="mid-desc">{item.desc || "No description provided."}</p>
          </div>

          {/* Details */}
          <div className="mid-section">
            <h4 className="mid-section-title">Details</h4>
            <div className="mid-detail-grid">
              <div className="mid-detail-block">
                <p className="mid-detail-label">Category</p>
                <p className="mid-detail-value">{categoryTitle}</p>
              </div>
              <div className="mid-detail-block">
                <p className="mid-detail-label">Price</p>
                <p className="mid-detail-value">${parseFloat(item.price).toFixed(2)}</p>
              </div>
              <div className="mid-detail-block">
                <p className="mid-detail-label">Status</p>
                <p className="mid-detail-value" style={{ color: isAvail ? "#22c55e" : "#ef4444" }}>
                  {isAvail ? "Available" : "Unavailable"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mid-actions">
            <button className="mid-btn-edit" onClick={() => { onClose(); onEdit(item); }}>
              ✏️ Edit Item
            </button>
            <button className="mid-btn-delete" onClick={() => { onClose(); onDelete(item._id); }}>
              🗑 Delete
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

/* ── main page ───────────────────────────────── */
const AdminMenuPage = () => {
  const { categoryTitle } = useParams();
  const navigate = useNavigate();

  /* data */
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);

  /* form */
  const [name, setName]           = useState("");
  const [price, setPrice]         = useState("");
  const [desc, setDesc]           = useState("");
  const [img, setImg]             = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [imageMode, setImageMode] = useState("url"); // "url" | "file"

  /* filter / sort */
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilter] = useState("All");   // All | Available | Unavailable
  const [sortBy, setSort]         = useState("default"); // default | low | high | az | newest
  const [showFilters, setShowFilters] = useState(false);

  /* drawer */
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => { fetchItems(); }, [categoryTitle]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/menu?categoryTitle=${categoryTitle}`);
      setItems(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  /* ── CRUD ── */
  const handleSubmit = async () => {
    if (!name || !price) return alert("Name and price are required.");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("desc", desc);
      if (imageMode === "file" && imageFile) {
        formData.append("imageFile", imageFile);
      } else if (imageMode === "url" && img) {
        formData.append("imageUrl", img);
      }
      const cfg = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "multipart/form-data" } };
      if (editingId) {
        await axios.put(`http://localhost:3000/api/menu/${editingId}`, formData, cfg);
      } else {
        formData.append("categoryTitle", categoryTitle);
        await axios.post("http://localhost:3000/api/menu/add-item", formData, cfg);
      }
      resetForm(); fetchItems(); setShowForm(false);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchItems();
    } catch (err) { console.error(err); }
  };

  const toggleAvailability = async (item) => {
    try {
      await axios.put(`http://localhost:3000/api/menu/${item._id}`,
        { ...item, isActive: item.isActive === false ? true : false },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      // optimistic update
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, isActive: !i.isActive } : i));
      if (selectedItem?._id === item._id) {
        setSelectedItem(prev => ({ ...prev, isActive: !prev.isActive }));
      }
    } catch (err) { console.error(err); }
  };

  const startEdit = (item) => {
    setEditingId(item._id); setName(item.name); setPrice(item.price);
    setDesc(item.desc || ""); setImg(item.img || ""); setImageFile(null);
    setImageMode("url"); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null); setName(""); setPrice(""); setDesc(""); setImg(""); setImageFile(null);
  };

  /* ── filter + sort ── */
  const displayedItems = useMemo(() => {
    let list = items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "All" ? true :
        filterStatus === "Available" ? item.isActive !== false :
        item.isActive === false;
      return matchSearch && matchStatus;
    });

    if (sortBy === "low")    list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "high")   list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "az")     list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "newest") list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [items, search, filterStatus, sortBy]);

  const totalAvail = items.filter(i => i.isActive !== false).length;
  const totalOut   = items.filter(i => i.isActive === false).length;

  return (
    <div className="amp-root">

      {/* ══ HEADER ══════════════════════════════════ */}
      <header className="amp-header">
        <div>
          <h1 className="amp-header-title">
            <button className="amp-back-btn" onClick={() => navigate("/admin/menu")} title="Back to Categories">
              ←
            </button>
            {decodeURIComponent(categoryTitle)}
          </h1>
          <p className="amp-header-sub">Manage items, pricing and availability</p>
        </div>
        <button className="amp-add-btn" onClick={() => { resetForm(); setEditingId(null); setShowForm(!showForm); }}>
          {showForm ? "✕ Cancel" : "+ Add Item"}
        </button>
      </header>

      {/* ══ STATS ═══════════════════════════════════ */}
      <div className="amp-stats-row">
        <div className="amp-stat-card">
          <p className="amp-stat-label">Total Items</p>
          <p className="amp-stat-value">{items.length}</p>
        </div>
        <div className="amp-stat-card">
          <p className="amp-stat-label">Available</p>
          <p className="amp-stat-value" style={{ color: "#22c55e" }}>{totalAvail}</p>
        </div>
        <div className="amp-stat-card">
          <p className="amp-stat-label">Out of Stock</p>
          <p className="amp-stat-value" style={{ color: "#ef4444" }}>{totalOut}</p>
        </div>
        <div className="amp-stat-card">
          <p className="amp-stat-label">Showing</p>
          <p className="amp-stat-value">{displayedItems.length}</p>
        </div>
      </div>

      {/* ══ ADD / EDIT FORM ══════════════════════════ */}
      {showForm && (
        <div className="amp-form-card">
          <h4 className="amp-form-title">{editingId ? "Edit Menu Item" : "Add New Item"}</h4>
          <div className="amp-form-grid">
            <div className="amp-field">
              <label>Item Name</label>
              <input placeholder="e.g. Double Cheese Deluxe" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="amp-field">
              <label>Price ($)</label>
              <input type="number" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div className="amp-field amp-field--full">
              <label>Description</label>
              <textarea rows="3" placeholder="What makes this item special?" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div className="amp-field amp-field--full">
              <label>Image</label>
              <div className="amp-img-toggle">
                <button type="button" className={imageMode === "url" ? "active" : ""} onClick={() => setImageMode("url")}>URL</button>
                <button type="button" className={imageMode === "file" ? "active" : ""} onClick={() => setImageMode("file")}>Upload File</button>
              </div>
              {imageMode === "url"
                ? <input placeholder="https://example.com/image.jpg" value={img} onChange={e => setImg(e.target.value)} />
                : <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0] || null)} />}
            </div>
          </div>
          <div className="amp-form-actions">
            <button className="amp-btn-cancel" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</button>
            <button className="amp-btn-save" onClick={handleSubmit}>
              {editingId ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </div>
      )}

      {/* ══ FILTER BAR ══════════════════════════════ */}
      <div className="amp-filter-bar">
        {/* Search */}
        <div className="amp-search-wrap">
          <span className="amp-search-icon">🔍</span>
          <input
            className="amp-search"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter pills */}
        <div className="amp-pills">
          {["All", "Available", "Unavailable"].map(s => (
            <button
              key={s}
              className={`amp-pill ${filterStatus === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >{s}</button>
          ))}
        </div>

        {/* Sort */}
        <select className="amp-sort" value={sortBy} onChange={e => setSort(e.target.value)}>
          <option value="default">Sort: Default</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
          <option value="az">A → Z</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* ══ ITEM GRID ═══════════════════════════════ */}
      {loading ? (
        <div className="amp-loading">Loading items…</div>
      ) : displayedItems.length === 0 ? (
        <div className="amp-empty">No items match your filters.</div>
      ) : (
        <div className="amp-grid">
          {displayedItems.map(item => {
            const imgSrc = resolveImg(item.img);
            const isAvail = item.isActive !== false;
            return (
              <div className="amp-card" key={item._id} onClick={() => setSelectedItem(item)}>
                {/* Image */}
                <div className="amp-card-img-wrap">
                  {imgSrc
                    ? <img src={imgSrc} alt={item.name} className="amp-card-img"
                        onError={e => { e.target.style.display = "none"; e.target.nextElementSibling.style.display = "flex"; }} />
                    : null}
                  <div className="amp-card-img-placeholder" style={{ display: imgSrc ? "none" : "flex" }}>🍔</div>
                  <div className={`amp-avail-badge ${isAvail ? "avail" : "unavail"}`}>
                    {isAvail ? "Available" : "Unavailable"}
                  </div>
                </div>

                {/* Info */}
                <div className="amp-card-body">
                  <h3 className="amp-card-name">{item.name}</h3>
                  <p className="amp-card-cat">{decodeURIComponent(categoryTitle)}</p>
                  <p className="amp-card-desc">{item.desc || "No description."}</p>
                  <div className="amp-card-footer">
                    <span className="amp-card-price">${parseFloat(item.price).toFixed(2)}</span>
                    <div className="amp-card-actions" onClick={e => e.stopPropagation()}>
                      <label className="switch" title="Toggle availability">
                        <input type="checkbox" checked={isAvail} onChange={() => toggleAvailability(item)} />
                        <span className="slider"></span>
                      </label>
                      <button className="amp-btn-icon edit" title="Edit" onClick={e => { e.stopPropagation(); startEdit(item); }}>✏️</button>
                      <button className="amp-btn-icon del" title="Delete" onClick={e => { e.stopPropagation(); handleDelete(item._id); }}>🗑</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ ITEM DETAIL DRAWER ═══════════════════════ */}
      {selectedItem && (
        <MenuItemDrawer
          item={selectedItem}
          categoryTitle={decodeURIComponent(categoryTitle)}
          onClose={() => setSelectedItem(null)}
          onEdit={startEdit}
          onToggle={toggleAvailability}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default AdminMenuPage;