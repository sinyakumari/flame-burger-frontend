import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();   // ✅ use context

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isLogin
      ? "http://localhost:3000/api/auth/login"
      : "http://localhost:3000/api/auth/register";

    const bodyData = isLogin
      ? { email, password }
      : { name, email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.ok) {

        // ✅ LOGIN
        if (isLogin) {

          login(data.token);  // 🔥 IMPORTANT

          const payload = JSON.parse(atob(data.token.split(".")[1]));

          if (payload.role === "admin") {
            navigate("/admin");   // 🔥 ADMIN REDIRECT
          } else if (location.state?.fromCheckout) {
            navigate("/checkout");
          } else {
            navigate("/");
          }

        } else {
          alert("Registration Successful 🔥 Please Login");
          setIsLogin(true);
        }

      } else {
        alert(data.message);
      }

    } catch (error) {
      alert("Server error");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <div className="card shadow p-4">
        <h3 className="text-center mb-4">
          {isLogin ? "🔥 Login to Flame Burger" : "🔥 Create Your Account"}
        </h3>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-danger w-100">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="text-center mt-3">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <span
                style={{ color: "red", cursor: "pointer" }}
                onClick={() => setIsLogin(false)}
              >
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                style={{ color: "red", cursor: "pointer" }}
                onClick={() => setIsLogin(true)}
              >
                Login
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;