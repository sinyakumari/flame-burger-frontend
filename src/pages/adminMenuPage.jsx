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
    <div className="admin-content-wrapper">
      <h2 className="admin-page-title">
        {decodeURIComponent(categoryTitle)} Items
      </h2>

      {/* ================= FORM ================= */}
      <div className="admin-form-card">
        <h5>{editingId ? "Edit Item" : "Add New Item"}</h5>

        <div className="row">
          <div className="col-md-6">
            <input
              className="form-control admin-input"
              placeholder="Item Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <input
              type="number"
              className="form-control admin-input"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="col-12 mt-3">
            <input
              className="form-control admin-input"
              placeholder="Image URL"
              value={img}
              onChange={(e) => setImg(e.target.value)}
            />
          </div>

          <div className="col-12 mt-3">
            <textarea
              className="form-control admin-input"
              placeholder="Description"
              rows="3"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="col-12 mt-3">
            <button
              className="btn btn-danger me-2"
              onClick={handleSubmit}
            >
              {editingId ? "Update Item" : "Add Item"}
            </button>

            {editingId && (
              <button
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= ITEMS GRID ================= */}
      <div className="admin-menu-grid">
        {items.length === 0 ? (
          <p className="mt-4">No items found.</p>
        ) : (
          items.map((item) => (
            <div className="admin-menu-card" key={item._id}>
              <div className="admin-menu-img">
                <img src={item.img} alt={item.name} />
              </div>

              <div className="admin-menu-body">
                <h5>{item.name}</h5>
                <p className="admin-menu-price">₹{item.price}</p>
                <p className="admin-menu-desc">
                  {item.desc}
                </p>

                <div className="admin-menu-actions">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => startEdit(item)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMenuPage;