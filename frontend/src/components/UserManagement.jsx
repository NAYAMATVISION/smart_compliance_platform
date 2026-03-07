import { useState, useEffect } from "react";
import API_URL from "../config";
import "./styles/userManagement.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee"
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/admin/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("User created successfully!");
        setFormData({ name: "", email: "", password: "", role: "employee" });
        setShowAddUser(false);
        fetchUsers();
      } else {
        setError(data.message || "Failed to create user");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        setMessage("Role updated successfully!");
        fetchUsers();
      } else {
        setError("Failed to update role");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setMessage("User deleted successfully!");
        fetchUsers();
      } else {
        setError("Failed to delete user");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  if (loading) {
    return <div className="user-management"><div className="loading">Loading users...</div></div>;
  }

  return (
    <div className="user-management">
      <div className="um-header">
        <h1>User Management</h1>
        <button onClick={() => setShowAddUser(!showAddUser)} className="btn-add-user">
          {showAddUser ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {message && <div className="alert-success">{message}</div>}
      {error && <div className="alert-error">{error}</div>}

      {showAddUser && (
        <div className="add-user-form">
          <h3>Add New User</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength="6"
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="viewer">Viewer</option>
            </select>
            <button type="submit" className="btn-submit">Create User</button>
          </form>
        </div>
      )}

      <div className="users-table">
        <div className="table-header">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Actions</div>
        </div>
        {users.map((user) => (
          <div key={user._id} className="table-row">
            <div>{user.name}</div>
            <div>{user.email}</div>
            <div>
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                className="role-select"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => handleDeleteUser(user._id)}
                className="btn-delete"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserManagement;
