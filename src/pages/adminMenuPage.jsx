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

  /* ================= FETCH ITEMS ================= */

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

  /* ================= ADD / UPDATE ================= */

  const handleSubmit = async () => {
    if (!name || !price) return alert("Name and price required");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };

      if (editingId) {
        // UPDATE
     await axios.put(
  `http://localhost:3000/api/menu/${editingId}`,
  { name, price, desc, img },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
);
      } else {
        // ADD
        await axios.post(
          "http://localhost:3000/api/menu/add-item",
          {
            name,
            price,
            desc,
            img,
            categoryTitle,
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

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
     console.log("DELETE ROUTE HIT");
    if (!window.confirm("Are you sure you want to delete this item?")) return;

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

  /* ================= EDIT ================= */

  const startEdit = (item) => {
    setEditingId(item._id);
    setName(item.name);
    setPrice(item.price);
    setDesc(item.desc);
    setImg(item.img);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setDesc("");
    setImg("");
  };

  return (
    <div className="container mt-4">
      <h2>{decodeURIComponent(categoryTitle)}</h2>

      {/* ================= FORM ================= */}
      <div className="card p-3 mb-4">
        <h5>{editingId ? "Edit Item" : "Add New Item"}</h5>

        <input
          className="form-control mb-2"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="form-control mb-2"
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          className="form-control mb-2"
          placeholder="Image URL"
          value={img}
          onChange={(e) => setImg(e.target.value)}
        />

        <textarea
          className="form-control mb-2"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <button className="btn btn-primary me-2" onClick={handleSubmit}>
          {editingId ? "Update Item" : "Add Item"}
        </button>

        {editingId && (
          <button className="btn btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        )}
      </div>

      {/* ================= TABLE ================= */}

      {items.length === 0 ? (
        <p>No items found</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th style={{ width: "120px" }}>Edit</th>
              <th style={{ width: "120px" }}>Delete</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>₹{item.price}</td>

                <td>
                  <button
                    className="btn btn-warning btn-sm w-100"
                    onClick={() => startEdit(item)}
                  >
                    Edit
                  </button>
                </td>

                <td>
                  <button
                    className="btn btn-danger btn-sm w-100"
                    onClick={() => handleDelete(item._id)}  // ✅ FIX HERE
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminMenuPage;