import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext";
import "./adminOrders.css";
import OrderDrawer from "../components/OrderDrawer";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null); // Drawer state
  const { token } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/orders/admin", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders");
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:3000/api/orders/admin/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state so drawer reflects new status immediately
      setOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
      );
      // If the drawer is open for this order, update it too
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update order status");
    }
  };

  const openDrawer = (order) => setSelectedOrder(order);
  const closeDrawer = () => setSelectedOrder(null);

  if (loading) return <div className="container mt-4">Loading orders...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  const filteredOrders = orders.filter(order => {
    if (filter === 'All') return true;
    return order.status === filter;
  });

  return (
    <div className="admin-orders-container">
      <div className="orders-header">
        <h2 className="orders-title">Order List</h2>
        <div className="orders-summary-pills">
          <span
            className={`summary-pill ${filter === 'All' ? 'active' : ''}`}
            onClick={() => setFilter('All')}
          >
            All {orders.length}
          </span>
          <span
            className={`summary-pill ${filter === 'Pending' ? 'active' : ''}`}
            onClick={() => setFilter('Pending')}
          >
            Pending {orders.filter(o => o.status === 'Pending').length}
          </span>
          <span
            className={`summary-pill ${filter === 'Completed' ? 'active' : ''}`}
            onClick={() => setFilter('Completed')}
          >
            Completed {orders.filter(o => o.status === 'Completed').length}
          </span>
        </div>
      </div>

      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="no-orders-msg">No {filter !== 'All' ? filter.toLowerCase() : ''} orders found.</div>
        ) : (
          filteredOrders.map(order => (
            <div className="order-ui-card" key={order._id}>
              {/* Card Header */}
              <div className="order-card-header">
                <div>
                  {/* Clickable Order ID */}
                  <h5
                    className="order-card-title order-id-clickable"
                    onClick={() => openDrawer(order)}
                    title="View order details"
                  >
                    Order #{order._id.substring(order._id.length - 6)}
                  </h5>
                  <p className="order-card-time">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                {/* Clickable User Avatar */}
                <div
                  className="order-user-avatar"
                  onClick={() => openDrawer(order)}
                  title={`View ${order.name}'s order`}
                >
                  {order.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Order Items List */}
              <div className="order-items-scroll">
                {order.items.map((item, idx) => (
                  <div className="order-food-item" key={idx}>
                    <div className="food-item-img">
                      {item.img ? (
                        <img
                          src={item.img.startsWith('http') || item.img.startsWith('/assets') ? item.img : `/src/assets/${item.img}`}
                          alt={item.name}
                          onError={(e) => {
                            if (!e.target.dataset.triedUploads && !item.img.startsWith('/uploads')) {
                              e.target.dataset.triedUploads = "true";
                              e.target.src = `http://localhost:3000/uploads/${item.img}`;
                            } else {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="placeholder-img" style={{ display: item.img ? 'none' : 'flex' }}>🍔</div>
                    </div>
                    <div className="food-item-details">
                      <h6>{item.name}</h6>
                      <p className="food-customization">{item.customization || "Standard"}</p>
                      <div className="food-price-qty">
                        <span className="food-price">${item.price.toFixed(2)}</span>
                        <span className="food-qty">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer */}
              <div className="order-card-footer">
                <div className="order-total-block">
                  <p className="total-label">{order.items.length} Items</p>
                  <h4 className="total-amount">${order.totalAmount.toFixed(2)}</h4>
                </div>

                <div className="order-actions-buttons">
                  {order.status === 'Pending' ? (
                    <>
                      <button
                        className="btn-action btn-reject"
                        onClick={() => updateOrderStatus(order._id, 'Cancelled')}
                        title="Cancel Order"
                      >
                        ✕
                      </button>
                      <button
                        className="btn-action btn-complete"
                        onClick={() => updateOrderStatus(order._id, 'Completed')}
                      >
                        ✓ COMPLETE
                      </button>
                    </>
                  ) : (
                    <span className={`status-label is-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          onClose={closeDrawer}
          onStatusChange={updateOrderStatus}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;