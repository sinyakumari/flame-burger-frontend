import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/admin.css";
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
    data: [0,0,0,0,0,0,0]
  });

  const [orderStatusData, setOrderStatusData] = useState([0,0,0]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const fetchDashboardData = async () => {
      try {

        const token = localStorage.getItem("token");

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const { data: statsData } =
          await axios.get("http://localhost:3000/api/orders/admin/stats", config);

        const { data: ordersData } =
          await axios.get("http://localhost:3000/api/orders/admin", config);

        let completed = 0;
        let pending = 0;
        let cancelled = 0;

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

        const today = new Date();

        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(today.getDate() - (6 - i));
          return d.toLocaleDateString("en-US", { weekday: "short" });
        });

        let weeklyOrdersRaw = [0,0,0,0,0,0,0];

        ordersData.forEach(o => {

          if(o.createdAt){

            const d = new Date(o.createdAt);
            d.setHours(0,0,0,0);

            const t = new Date();
            t.setHours(0,0,0,0);

            const diffTime = t - d;

            const diffDays =
              Math.floor(diffTime / (1000*60*60*24));

            if(diffDays >=0 && diffDays <7){

              const dayStr =
                d.toLocaleDateString("en-US",{weekday:"short"});

              const idx = last7Days.indexOf(dayStr);

              if(idx !== -1) weeklyOrdersRaw[idx]++;

            }

          }

        });

        setWeeklyOrders({
          labels: last7Days,
          data: weeklyOrdersRaw
        });

        setRecentOrders(ordersData.slice(0,10));

      }

      catch(err){
        console.error("Dashboard Error:",err);
      }

      finally{
        setIsLoading(false);
      }

    };

    fetchDashboardData();

  },[]);

  const lineChartData = {
    labels: weeklyOrders.labels,
    datasets:[
      {
        label:"Orders",
        data:weeklyOrders.data,
        borderColor:"#ff2e2e",
        backgroundColor:"rgba(255,46,46,0.2)",
        tension:0.4,
        fill:true
      }
    ]
  };

  const lineChartOptions = {
    responsive:true,
    maintainAspectRatio:false,
    plugins:{ legend:{display:false} },
    scales:{
      y:{ grid:{color:"rgba(255,255,255,0.05)"} },
      x:{ grid:{display:false} }
    }
  };

  const doughnutChartData = {
    labels:["Completed","Pending","Cancelled"],
    datasets:[
      {
        data:orderStatusData,
        backgroundColor:["#22c55e","#facc15","#ef4444"],
        borderWidth:0
      }
    ]
  };

  const doughnutChartOptions = {
    responsive:true,
    maintainAspectRatio:false,
    cutout:"75%",
    plugins:{
      legend:{
        position:"bottom",
        labels:{color:"#fff",padding:20}
      }
    }
  };

  if(isLoading){
    return <div style={{padding:"50px",color:"#888"}}>
      Loading Dashboard...
    </div>
  }

  return (

    <div>

      <h2 className="dashboard-title">
        Dashboard Overview
      </h2>

      <p style={{color:"#888",marginBottom:"30px",fontSize:"14px"}}>
        Welcome back, here's what's happening today.
      </p>

      {/* KPI CARDS */}

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
        gap:"20px",
        marginBottom:"30px"
      }}>

        <div className="admin-stat-card">
          <div>Total Orders</div>
          <h2>{stats.totalOrders}</h2>
        </div>

        <div className="admin-stat-card">
          <div>Total Revenue</div>
          <h2>${stats.totalRevenue.toFixed(2)}</h2>
        </div>

        <div className="admin-stat-card">
          <div>Total Users</div>
          <h2>{stats.totalUsers}</h2>
        </div>

        <div className="admin-stat-card">
          <div>Pending Orders</div>
          <h2 style={{color:"#facc15"}}>
            {stats.pendingOrders}
          </h2>
        </div>

      </div>

      {/* CHARTS */}

      <div style={{
        display:"grid",
        gridTemplateColumns:"2fr 1fr",
        gap:"20px",
        marginBottom:"30px"
      }}>

        <div className="admin-chart-card">

          <h4>Weekly Orders</h4>

          <div style={{height:"300px"}}>
            <Line data={lineChartData} options={lineChartOptions}/>
          </div>

        </div>

        <div className="admin-chart-card">

          <h4>Order Status</h4>

          <div style={{height:"300px"}}>
            <Doughnut
              data={doughnutChartData}
              options={doughnutChartOptions}
            />
          </div>

        </div>

      </div>

      {/* RECENT ORDERS */}

      <div className="admin-orders-card">

        <h4>Latest Orders</h4>

        <table className="admin-orders-table">

          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {recentOrders.slice(0,5).map(o => (

              <tr key={o._id}>

                <td>
                  #{o._id.substring(o._id.length-6)}
                </td>

                <td>
                  {o.user ? o.user.name : o.name}
                </td>

                <td>
                  {o.items.reduce(
                    (a,i)=>a+i.quantity,0
                  )} Items
                </td>

                <td>
                  ${o.finalAmount
                    ? o.finalAmount.toFixed(2)
                    : o.totalAmount.toFixed(2)}
                </td>

                <td>{o.status}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}