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
    <div>
      <h2 className="dashboard-title">Dashboard Overview</h2>
      <p style={{color: '#888', marginBottom: '30px', fontSize: '14px'}}>
        Welcome back, here's what's happening today.
      </p>

      {/* KPI Cards */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px'}}>
        <div style={{background: '#111', border: '1px solid #1f1f1f', padding: '24px', borderRadius: '16px'}}>
          <div style={{fontSize: '13px', color: '#888', marginBottom: '8px'}}>Total Orders</div>
          <div style={{fontSize: '28px', fontWeight: '700'}}>{stats.totalOrders}</div>
        </div>
        <div style={{background: '#111', border: '1px solid #1f1f1f', padding: '24px', borderRadius: '16px'}}>
          <div style={{fontSize: '13px', color: '#888', marginBottom: '8px'}}>Total Revenue</div>
          <div style={{fontSize: '28px', fontWeight: '700'}}>${stats.totalRevenue.toFixed(2)}</div>
        </div>
        <div style={{background: '#111', border: '1px solid #1f1f1f', padding: '24px', borderRadius: '16px'}}>
          <div style={{fontSize: '13px', color: '#888', marginBottom: '8px'}}>Total Users</div>
          <div style={{fontSize: '28px', fontWeight: '700'}}>{stats.totalUsers}</div>
        </div>
        <div style={{background: '#111', border: '1px solid #1f1f1f', padding: '24px', borderRadius: '16px'}}>
          <div style={{fontSize: '13px', color: '#888', marginBottom: '8px'}}>Pending Orders</div>
          <div style={{fontSize: '28px', fontWeight: '700', color: '#facc15'}}>{stats.pendingOrders}</div>
        </div>
      </div>

      {/* Charts & Activity Grid */}
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px'}} className="responsive-grid">
        {/* Weekly Orders */}
        <div style={{background: '#111', border: '1px solid #1f1f1f', padding: '24px', borderRadius: '16px', height: '400px', display: 'flex', flexDirection: 'column'}}>
          <h4 style={{marginBottom: '20px', fontSize: '16px'}}>Weekly Orders</h4>
          <div style={{flexGrow: 1, position: 'relative'}}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Status Donut */}
        <div style={{background: '#111', border: '1px solid #1f1f1f', padding: '24px', borderRadius: '16px', height: '400px', display: 'flex', flexDirection: 'column'}}>
          <h4 style={{marginBottom: '20px', fontSize: '16px'}}>Order Status</h4>
          <div style={{flexGrow: 1, position: 'relative'}}>
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px'}} className="responsive-grid">
        {/* Recent Activity */}
        <div style={{background: '#111', border: '1px solid #1f1f1f', padding: '24px', borderRadius: '16px', maxHeight: '500px', overflowY: 'auto'}}>
          <h4 style={{marginBottom: '20px', fontSize: '16px'}}>Recent Activity</h4>
          <div className="activity-list">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order._id} className="activity-item">
                <span className={`activity-dot ${order.status === 'Completed' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'info'}`}></span>
                <div>
                  <strong>{order.user ? order.user.name : order.name}</strong> Placed order
                  <p className="activity-time" style={{margin: '4px 0 0 0'}}>{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <span style={{fontSize: '13px', color: '#888'}}>No recent activity.</span>}
          </div>
        </div>

        {/* Orders Table */}
        <div style={{background: '#111', border: '1px solid #1f1f1f', padding: '24px', borderRadius: '16px', overflowX: 'auto'}}>
          <h4 style={{marginBottom: '20px', fontSize: '16px'}}>Latest Orders</h4>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left'}}>
            <thead>
              <tr style={{borderBottom: '1px solid #222', color: '#888'}}>
                <th style={{paddingBottom: '12px'}}>Order ID</th>
                <th style={{paddingBottom: '12px'}}>Customer</th>
                <th style={{paddingBottom: '12px'}}>Items</th>
                <th style={{paddingBottom: '12px'}}>Price</th>
                <th style={{paddingBottom: '12px'}}>Status</th>
                <th style={{paddingBottom: '12px'}}>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.slice(0, 5).map(o => (
                <tr key={o._id} style={{borderBottom: '1px solid #1f1f1f'}}>
                  <td style={{padding: '16px 0', color: '#e63946'}}>#{o._id.substring(o._id.length-6)}</td>
                  <td style={{padding: '16px 0'}}>{o.user ? o.user.name : o.name}</td>
                  <td style={{padding: '16px 0'}}>{o.items.reduce((acc, item) => acc + item.quantity, 0)} Items</td>
                  <td style={{padding: '16px 0', fontWeight: '600'}}>${o.finalAmount ? o.finalAmount.toFixed(2) : o.totalAmount.toFixed(2)}</td>
                  <td style={{padding: '16px 0'}}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                      background: o.status === 'Completed' ? 'rgba(34, 197, 94, 0.1)' : o.status === 'Pending' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: o.status === 'Completed' ? '#22c55e' : o.status === 'Pending' ? '#facc15' : '#ef4444'
                    }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{padding: '16px 0', color: '#888'}}>{new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && <div style={{padding: '20px 0', color: '#888', fontSize: '13px'}}>No orders found.</div>}
        </div>
      </div>
    </div>
  );
}