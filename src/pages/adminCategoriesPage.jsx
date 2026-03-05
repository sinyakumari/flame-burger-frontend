import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
        headers: {
          "Content-Type": "application/json",
        },
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

  if (loading) return <p className="mt-4">Loading...</p>;

  return (
    <div className="container mt-4">
      <h2>Manage Categories</h2>

      <div className="mb-3 d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="New Category Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="btn btn-primary" onClick={addCategory}>
          Add
        </button>
      </div>

      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td>
                  <span
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => navigate(`/admin/menu/${cat.title}`)}
                  >
                    {cat.title}
                  </span>
                </td>

                <td>{cat.isActive ? "Active" : "Hidden"}</td>

                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteCategory(cat._id)}
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
}

export default AdminCategoriesPage;