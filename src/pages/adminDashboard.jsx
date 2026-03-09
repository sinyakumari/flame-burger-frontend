import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/admin.css"; // Using their global admin.css
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    totalOrders: 0, 
    totalRevenue: 0, 
    totalUsers: 0, 
    pendingOrders: 0 
  });
  
  const [weeklyOrders, setWeeklyOrders] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [0, 0, 0, 0, 0, 0, 0]
  });
  
  const [orderStatusData, setOrderStatusData] = useState([0, 0, 0]); // Completed, Pending, Cancelled
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // 1. Fetch Stats & Users
        const { data: statsData } = await axios.get("http://localhost:3000/api/orders/admin/stats", config);
        
        // Let's also fetch total users if we can't reliably get from stats. 
        // Order controller stats route has totalUsers built in based on previous analysis.
        
        // 2. Fetch All Orders to compute charts & tables
        const { data: ordersData } = await axios.get("http://localhost:3000/api/orders/admin", config);
        
        // Compute Pending Orders and Status Distribution
        let completed = 0; let pending = 0; let cancelled = 0;
        ordersData.forEach(o => {
           if(o.status === "Completed") completed++;
           else if(o.status === "Pending") pending++;
           else if(o.status === "Cancelled") cancelled++;
        });
        
        setStats({
           totalOrders: statsData.totalOrders || 0,
           totalRevenue: statsData.totalRevenue || 0,
           totalUsers: statsData.totalUsers || 0,
           pendingOrders: pending
        });
        setOrderStatusData([completed, pending, cancelled]);

        // Compute Weekly Orders
        const today = new Date();
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (6 - i));
            return d.toLocaleDateString("en-US", { weekday: "short" });
        });
        let weeklyOrdersRaw = [0, 0, 0, 0, 0, 0, 0];

        ordersData.forEach(o => {
            if(o.createdAt) {
              const d = new Date(o.createdAt);
              d.setHours(0,0,0,0);
              const t = new Date(); t.setHours(0,0,0,0);
              const diffTime = t - d;
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              if(diffDays >= 0 && diffDays < 7) {
                 const dayStr = d.toLocaleDateString("en-US", { weekday: "short" });
                 const idx = last7Days.indexOf(dayStr);
                 if(idx !== -1) weeklyOrdersRaw[idx]++;
              }
            }
        });
        setWeeklyOrders({ labels: last7Days, data: weeklyOrdersRaw });

        // Extract Recent Orders for Activity & Table
        setRecentOrders(ordersData.slice(0, 10)); // Take top 10 for table and activity

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const lineChartData = {
    labels: weeklyOrders.labels,
    datasets: [
      {
        label: "Orders",
        data: weeklyOrders.data,
        borderColor: "#ff2e2e",
        backgroundColor: "rgba(255,46,46,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { grid: { color: "rgba(255,255,255,0.05)" } },
      x: { grid: { display: false } }
    }
  };

  const doughnutChartData = {
    labels: ["Completed", "Pending", "Cancelled"],
    datasets: [
      {
        data: orderStatusData,
        backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };
  
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: { position: 'bottom', labels: { color: "#fff", padding: 20 } }
    }
  };

  if (isLoading) {
    return <div style={{padding: '50px', color: '#888'}}>Loading Dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Dashboard Overview</h2>
        <p className="dashboard-subtitle">
          Welcome back, here's what's happening today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="bento-grid-kpi">
        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">Total Orders</span>
            <h3 className="kpi-value">{stats.totalOrders}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">Total Revenue</span>
            <h3 className="kpi-value">${stats.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">Total Users</span>
            <h3 className="kpi-value">{stats.totalUsers}</h3>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">Pending Orders</span>
            <h3 className="kpi-value text-pending">{stats.pendingOrders}</h3>
          </div>
        </div>
      </div>

      {/* Charts & Activity Grid */}
      <div className="bento-grid-main">
        {/* Weekly Orders */}
        <div className="bento-card">
          <div className="bento-card-header">
            <h5>Weekly Orders</h5>
          </div>
          <div className="chart-wrapper">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Status Donut */}
        <div className="bento-card">
          <div className="bento-card-header">
            <h5>Order Status</h5>
          </div>
          <div className="chart-wrapper donut-wrapper">
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </div>
      </div>

      <div className="bento-grid-main reverse">
        {/* Recent Activity */}
        <div className="bento-card">
          <div className="bento-card-header">
            <h5>Recent Activity</h5>
          </div>
          <div className="activity-list">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order._id} className="activity-item">
                <span className={`activity-dot ${order.status === 'Completed' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'info'}`}></span>
                <div className="activity-content">
                  <span className="activity-text">
                    <strong>{order.user ? order.user.name : order.name}</strong> Placed order
                  </span>
                  <p className="activity-time">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <span className="no-data">No recent activity.</span>}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bento-card overflow-x">
          <div className="bento-card-header">
            <h5>Latest Orders</h5>
          </div>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Price</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.slice(0, 5).map(o => (
                <tr key={o._id}>
                  <td className="order-id">#{o._id.substring(o._id.length-6)}</td>
                  <td>{o.user ? o.user.name : o.name}</td>
                  <td>{o.items.reduce((acc, item) => acc + item.quantity, 0)} Items</td>
                  <td className="order-amount">${o.finalAmount ? o.finalAmount.toFixed(2) : o.totalAmount.toFixed(2)}</td>
                  <td>
                    <span className={`status-pill ${o.status.toLowerCase()}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="order-time">{new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && <div className="no-data">No orders found.</div>}
        </div>
      </div>
    </div>
  );
}