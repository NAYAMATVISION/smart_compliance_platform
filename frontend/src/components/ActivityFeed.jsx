import { useState, useEffect } from "react";
import API_URL from "../config";
import "./styles/activityFeed.css";

function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`${API_URL}/activity/recent`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch activities");
      }

      const data = await res.json();
      setActivities(data.activities || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("No activity available");
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action) => {
    if (!action) return "performed an action";
    return action.replace(/_/g, " ").toLowerCase();
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  const getActionIcon = (action) => {
    if (!action) return "📄";
    if (action.includes("UPLOADED")) return "📤";
    if (action.includes("UPDATED")) return "✏️";
    if (action.includes("ARCHIVED")) return "📦";
    if (action.includes("DELETED")) return "🗑️";
    return "📄";
  };

  if (loading) {
    return (
      <div className="activity-feed">
        <div className="activity-loading">Loading activity...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-feed">
        <div className="activity-empty">{error}</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="activity-feed">
        <div className="activity-empty">No recent activity</div>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {activities.map((activity, index) => (
        <div key={activity._id || index} className="activity-item">
          <span className="activity-icon">{getActionIcon(activity.action)}</span>
          <div className="activity-content">
            <div className="activity-text">
              <strong>{activity.userId?.name || "User"}</strong> {formatAction(activity.action)} <span className="activity-doc">{activity.documentName}</span>
            </div>
            <div className="activity-time">{getRelativeTime(activity.timestamp)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityFeed;
