import React, { useState, useEffect } from "react";
import axios from "axios";
import "./adminProfile.css";

const AdminProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [message, setMessage] = useState({ type: "", text: "" });

    const API_URL = "http://localhost:3000/api/admin/profile";

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log("🛠 [DEBUG] Token found:", token ? "Yes" : "No");
            
            const res = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log("🛠 [DEBUG] Profile Data Received:", res.data);
            setProfile(res.data);
            setFormData({
                name: res.data.name,
                email: res.data.email,
                phone: res.data.phone || ""
            });
        } catch (error) {
            console.error("🛠 [DEBUG] Fetch Profile Error:", error.response || error);
            setMessage({ 
                type: "error", 
                text: error.response?.data?.message || "Failed to load profile details." 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(API_URL, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setProfile(res.data.user);
            // Also update local storage if needed
            const storedInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            localStorage.setItem("userInfo", JSON.stringify({ ...storedInfo, name: res.data.user.name, email: res.data.user.email }));
            
            setMessage({ type: "success", text: "Profile updated successfully! 🎉" });
            setIsEditing(false);
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            console.error("Update Error:", error);
            setMessage({ type: "error", text: error.response?.data?.message || "Error updating profile." });
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        console.log("🔄 Initiating Password Update...");
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match!" });
            return;
        }
        
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put("http://localhost:3000/api/admin/profile/password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage({ type: "success", text: "Password updated successfully! 🔐" });
            setShowPasswordForm(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            console.error("Password Update Error:", error);
            setMessage({ type: "error", text: error.response?.data?.message || "Error updating password." });
        }
    };

    if (loading) return <div className="ap-container"><h2 className="text-white">Loading Profile...</h2></div>;

    if (!profile) return <div className="ap-container"><h2 className="text-white">Profile not found.</h2></div>;

    return (
        <div className="ap-container">
            <h1 className="dashboard-title mb-4" style={{ color: '#ff2e2e', fontWeight: '700' }}>Admin Profile</h1>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4`}>
                    {message.text}
                </div>
            )}

            <div className="ap-card">
                <div className="ap-header-banner">
                    <div className="ap-profile-img-container">
                        <img 
                            className="ap-profile-img"
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=e63946&color=fff&size=200`}
                            alt={profile.name}
                        />
                    </div>
                </div>

                <div className="ap-body">
                    <div className="ap-info-header">
                        <div className="ap-name-role">
                            <h2>{profile.name}</h2>
                            <p>{profile.role}</p>
                        </div>
                        {!isEditing && !showPasswordForm && (
                            <div className="ap-header-actions">
                                <button className="ap-edit-btn" onClick={() => setIsEditing(true)}>
                                    <i className="bi bi-pencil-square"></i> Edit Profile
                                </button>
                                <button className="ap-pwd-btn" onClick={() => setShowPasswordForm(true)}>
                                    <i className="bi bi-shield-lock"></i> Change Password
                                </button>
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <form className="ap-form" onSubmit={handleUpdate}>
                            <div className="ap-grid">
                                <div className="ap-input-group">
                                    <label className="ap-label">Full Name</label>
                                    <input 
                                        type="text"
                                        className="ap-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="ap-input-group">
                                    <label className="ap-label">Email Address</label>
                                    <input 
                                        type="email"
                                        className="ap-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="ap-input-group">
                                    <label className="ap-label">Phone Number</label>
                                    <input 
                                        type="text"
                                        className="ap-input"
                                        placeholder="Add phone number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="ap-form-actions">
                                <button type="submit" className="ap-save-btn">Save Changes</button>
                                <button type="button" className="ap-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="ap-grid">
                            <div className="ap-item">
                                <span className="ap-label">Email Address</span>
                                <span className="ap-value">{profile.email}</span>
                            </div>
                            <div className="ap-item">
                                <span className="ap-label">Phone Number</span>
                                <span className="ap-value">{profile.phone || "Not provided"}</span>
                            </div>
                            <div className="ap-item">
                                <span className="ap-label">Role</span>
                                <span className="ap-value" style={{ textTransform: 'capitalize' }}>{profile.role}</span>
                            </div>
                            <div className="ap-item">
                                <span className="ap-label">Account Created</span>
                                <span className="ap-value">{new Date(profile.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                        </div>
                    )}

                    {showPasswordForm && (
                        <div className="ap-password-section mt-5">
                            <h3 className="section-subtitle">🔐 Change Password</h3>
                            <form className="ap-form" onSubmit={handlePasswordUpdate}>
                                <div className="ap-grid">
                                    <div className="ap-input-group">
                                        <label className="ap-label">Current Password</label>
                                        <input 
                                            type="password"
                                            className="ap-input"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="ap-input-group">
                                        <label className="ap-label">New Password</label>
                                        <input 
                                            type="password"
                                            className="ap-input"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="ap-input-group">
                                        <label className="ap-label">Confirm New Password</label>
                                        <input 
                                            type="password"
                                            className="ap-input"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="ap-form-actions">
                                    <button type="submit" className="ap-save-btn">Update Password</button>
                                    <button type="button" className="ap-cancel-btn" onClick={() => setShowPasswordForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
