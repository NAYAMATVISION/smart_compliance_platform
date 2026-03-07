import { useState, useEffect } from "react";
import EvidenceUpload from "./EvidenceUpload";
import ActivityFeed from "./ActivityFeed";
import API_URL from "../config";
import "./styles/dashboard.css";

function Dashboard() {
  console.log("[Dashboard] Component mounted");
  
  const [summary, setSummary] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskEvidenceStatus, setTaskEvidenceStatus] = useState({});
  const [userRole, setUserRole] = useState("viewer");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role || "viewer");
    }
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    
    try {
      const [summaryRes, upcomingRes, tasksRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/dashboard/upcoming`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/dashboard/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const summaryData = await summaryRes.json();
      const upcomingData = await upcomingRes.json();
      const tasksData = await tasksRes.json();

      setSummary(summaryData);
      setUpcoming(upcomingData);
      setTasks(tasksData);

      // Fetch evidence status for all tasks
      const evidenceStatuses = {};
      await Promise.all(
        tasksData.map(async (task) => {
          try {
            const evidenceRes = await fetch(`${API_URL}/evidence/task/${task._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const evidenceData = await evidenceRes.json();
            evidenceStatuses[task._id] = evidenceData.length > 0;
          } catch (err) {
            evidenceStatuses[task._id] = false;
          }
        })
      );
      setTaskEvidenceStatus(evidenceStatuses);
    } catch (error) {
      console.error("[Dashboard] Error fetching data:", error);
    }
  };

  useEffect(() => {
    console.log("[Dashboard] useEffect triggered - fetching data");
    const loadData = async () => {
      await fetchData();
      setLoading(false);
      console.log("[Dashboard] Loading complete");
    };
    loadData();
  }, []);

  const handleCompleteTask = async (taskId) => {
    console.log("[Dashboard] Completing task:", taskId);
    setCompletingTask(taskId);
    const token = localStorage.getItem("token");
    console.log("[Dashboard] Token:", token ? "exists" : "missing");

    try {
      const url = `${API_URL}/dashboard/tasks/${taskId}/complete`;
      console.log("[Dashboard] Calling:", url);
      
      const res = await fetch(url, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("[Dashboard] Response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("[Dashboard] Task completed:", data);
        await fetchData();
        setSelectedTask(null);
        console.log("[Dashboard] Data refreshed");
      } else {
        const error = await res.json();
        alert(error.message || "Failed to complete task");
        console.error("[Dashboard] Error response:", error);
      }
    } catch (error) {
      alert("Error completing task");
      console.error("[Dashboard] Error completing task:", error);
    } finally {
      setCompletingTask(null);
      console.log("[Dashboard] Completing task finished");
    }
  };

  const getDaysLeft = (dueDate) => {
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getUrgencyClass = (dueDate) => {
    const days = getDaysLeft(dueDate);
    if (days <= 3) return "urgency-critical";
    if (days <= 7) return "urgency-high";
    if (days <= 14) return "urgency-medium";
    return "urgency-low";
  };

  const formatDaysLeft = (dueDate) => {
    const days = getDaysLeft(dueDate);
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days}d left`;
  };

  const getStatusClass = (status) => {
    const statusMap = {
      completed: "status-completed",
      pending: "status-pending",
      overdue: "status-overdue"
    };
    return statusMap[status?.toLowerCase()] || "status-pending";
  };

  // Analytics calculations
  const getAnalytics = () => {
    if (!tasks || tasks.length === 0) return null;

    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Status distribution
    const statusCounts = tasks.reduce((acc, task) => {
      const status = task.status?.toLowerCase() || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Category distribution
    const categoryCounts = tasks.reduce((acc, task) => {
      const category = task.category || "General";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Upcoming pressure (next 30 days)
    const upcomingCount = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= thirtyDaysFromNow && task.status !== "completed";
    }).length;

    // Completion rate
    const completedCount = statusCounts.completed || 0;
    const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    return {
      statusCounts,
      categoryCounts,
      upcomingCount,
      completionRate,
      totalTasks: tasks.length
    };
  };

  const analytics = getAnalytics();

  // Smart prioritization - Focus Today
  const getFocusTasks = () => {
    if (!tasks || tasks.length === 0) return [];

    const today = new Date();
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    return tasks
      .filter(task => task.status?.toLowerCase() !== "completed")
      .sort((a, b) => {
        const aDate = new Date(a.dueDate);
        const bDate = new Date(b.dueDate);
        const aDaysLeft = Math.ceil((aDate - today) / (1000 * 60 * 60 * 24));
        const bDaysLeft = Math.ceil((bDate - today) / (1000 * 60 * 60 * 24));

        // Overdue tasks first
        const aOverdue = aDaysLeft < 0;
        const bOverdue = bDaysLeft < 0;
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // Then by nearest due date
        if (aDaysLeft !== bDaysLeft) return aDaysLeft - bDaysLeft;

        // If same date, higher priority wins
        const aPriority = priorityWeight[a.priority?.toLowerCase()] || 1;
        const bPriority = priorityWeight[b.priority?.toLowerCase()] || 1;
        return bPriority - aPriority;
      })
      .slice(0, 3);
  };

  const focusTasks = getFocusTasks();

  // Risk indicator logic
  const getRiskLevel = () => {
    if (!summary) return null;
    
    const overdue = summary.overdue || 0;
    const dueSoon = summary.dueSoon || 0;

    if (overdue > 0) {
      return {
        level: "HIGH",
        icon: "🔴",
        message: "Critical delays detected. Immediate action required.",
        className: "risk-high"
      };
    } else if (dueSoon > 5) {
      return {
        level: "MEDIUM",
        icon: "🟡",
        message: "Some obligations require attention soon.",
        className: "risk-medium"
      };
    } else {
      return {
        level: "LOW",
        icon: "🟢",
        message: "Compliance posture is stable.",
        className: "risk-low"
      };
    }
  };

  const riskLevel = getRiskLevel();

  if (loading) {
    console.log("[Dashboard] Rendering loading state");
    return (
      <div className="dashboard-container">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }

  console.log("[Dashboard] Rendering main content");
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Compliance Dashboard</h1>
        <p>Monitor obligations and risk posture</p>
      </div>

      {/* Risk Indicator Banner */}
      {riskLevel && (
        <div className={`risk-banner ${riskLevel.className}`}>
          <span className="risk-icon">{riskLevel.icon}</span>
          <span className="risk-message">{riskLevel.message}</span>
        </div>
      )}

      {/* Compliance Intelligence */}
      {summary && (summary.healthScore !== undefined || summary.applicabilitySummary || (summary.topRiskDomains && summary.topRiskDomains.length > 0)) && (
        <div className="intelligence-section">
          <div className="intelligence-header">
            <h2 className="intelligence-title">📊 Compliance Intelligence</h2>
            <p className="intelligence-subtitle">Smart insights based on your business profile</p>
          </div>
          <div className="intelligence-grid">
            {summary.healthScore !== undefined && (
              <div className="intelligence-card health-card">
                <div className="card-icon">💚</div>
                <div className="card-content">
                  <div className="intelligence-label">Health Score</div>
                  <div className="intelligence-value-large">{summary.healthScore}<span className="value-unit">/100</span></div>
                  <div className="intelligence-bar">
                    <div 
                      className="intelligence-bar-fill" 
                      style={{ 
                        width: `${summary.healthScore}%`,
                        backgroundColor: summary.healthScore >= 80 ? '#10b981' : summary.healthScore >= 60 ? '#f59e0b' : '#ef4444'
                      }}
                    ></div>
                  </div>
                  <div className="health-status">
                    {summary.healthScore >= 80 ? '✓ Excellent' : summary.healthScore >= 60 ? '⚠ Needs Attention' : '⚠ Critical'}
                  </div>
                </div>
              </div>
            )}
            {summary.topRiskDomains && summary.topRiskDomains.length > 0 && (
              <div className="intelligence-card risk-card">
                <div className="card-icon">🎯</div>
                <div className="card-content">
                  <div className="intelligence-label">Top Risk Domains</div>
                  <div className="risk-domains-list">
                    {summary.topRiskDomains.map((domain, idx) => (
                      <div key={idx} className="risk-domain-item">
                        <div className="risk-rank">#{idx + 1}</div>
                        <span className="risk-domain-name">{domain.name}</span>
                        <span className="risk-domain-score">{domain.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {summary.applicabilitySummary && (
              <div className="intelligence-card summary-card">
                <div className="card-icon">📋</div>
                <div className="card-content">
                  <div className="intelligence-label">Regulatory Environment</div>
                  <p className="intelligence-text">{summary.applicabilitySummary}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{summary?.total || 0}</div>
          <div className="metric-label">Total Tasks</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{summary?.pending || 0}</div>
          <div className="metric-label">Pending</div>
        </div>
        <div className="metric-card metric-warning">
          <div className="metric-value">{summary?.dueSoon || 0}</div>
          <div className="metric-label">Due Soon</div>
        </div>
        <div className={`metric-card metric-alert ${(summary?.overdue || 0) > 0 ? 'has-alert' : ''}`}>
          <div className="metric-value">{summary?.overdue || 0}</div>
          <div className="metric-label">Overdue</div>
        </div>
      </div>

      {/* Focus Today */}
      {focusTasks.length > 0 && (
        <div className="focus-section">
          <div className="focus-header">
            <span className="focus-icon">🔥</span>
            <h2 className="focus-title">Focus Today</h2>
          </div>
          <div className="focus-list">
            {focusTasks.map((task) => (
              <div key={task._id} className="focus-item">
                <div className="focus-main">
                  <div className="focus-task-title">{task.title}</div>
                  <div className="focus-meta">
                    <span className="focus-category">{task.category}</span>
                    <span className="focus-separator">•</span>
                    <span className={`focus-due ${getDaysLeft(task.dueDate) < 0 ? 'focus-overdue' : ''}`}>
                      {formatDaysLeft(task.dueDate)}
                    </span>
                  </div>
                </div>
                {(userRole === "admin" || userRole === "manager" || userRole === "employee") && (
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="focus-action-btn"
                  >
                    {taskEvidenceStatus[task._id] ? "Complete" : "Upload Evidence"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {analytics && (
        <div className="analytics-section">
          <h2 className="section-title">Analytics & Insights</h2>
          <div className="analytics-grid">
            {/* Status Distribution */}
            <div className="chart-card">
              <h3 className="chart-title">Status Distribution</h3>
              <div className="chart-content">
                <div className="donut-chart">
                  <div className="donut-center">
                    <div className="donut-value">{analytics.totalTasks}</div>
                    <div className="donut-label">Total</div>
                  </div>
                  <svg viewBox="0 0 100 100" className="donut-svg">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                    {(() => {
                      let offset = 0;
                      const total = analytics.totalTasks;
                      const colors = { completed: "#10b981", pending: "#f59e0b", overdue: "#ef4444" };
                      return Object.entries(analytics.statusCounts).map(([status, count]) => {
                        const percentage = (count / total) * 100;
                        const dashArray = (percentage / 100) * 251.2;
                        const dashOffset = -offset;
                        offset += dashArray;
                        return (
                          <circle
                            key={status}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={colors[status] || "#6b7280"}
                            strokeWidth="12"
                            strokeDasharray={`${dashArray} 251.2`}
                            strokeDashoffset={dashOffset}
                            transform="rotate(-90 50 50)"
                          />
                        );
                      });
                    })()}
                  </svg>
                </div>
                <div className="chart-legend">
                  {Object.entries(analytics.statusCounts).map(([status, count]) => (
                    <div key={status} className="legend-item">
                      <span className={`legend-dot legend-${status}`}></span>
                      <span className="legend-text">{status}</span>
                      <span className="legend-value">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="chart-card">
              <h3 className="chart-title">Category Breakdown</h3>
              <div className="chart-content">
                <div className="bar-chart">
                  {Object.entries(analytics.categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, count]) => {
                      const maxCount = Math.max(...Object.values(analytics.categoryCounts));
                      const percentage = (count / maxCount) * 100;
                      return (
                        <div key={category} className="bar-item">
                          <div className="bar-label">{category}</div>
                          <div className="bar-container">
                            <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                            <span className="bar-value">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Upcoming Pressure */}
            <div className="chart-card">
              <h3 className="chart-title">Next 30 Days</h3>
              <div className="chart-content stat-content">
                <div className="stat-large">{analytics.upcomingCount}</div>
                <div className="stat-description">Tasks due in next 30 days</div>
                <div className="stat-indicator">
                  {analytics.upcomingCount > 10 ? (
                    <span className="indicator-high">High pressure</span>
                  ) : analytics.upcomingCount > 5 ? (
                    <span className="indicator-medium">Moderate load</span>
                  ) : (
                    <span className="indicator-low">Manageable</span>
                  )}
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="chart-card">
              <h3 className="chart-title">Completion Rate</h3>
              <div className="chart-content stat-content">
                <div className="stat-large">{analytics.completionRate}%</div>
                <div className="stat-description">Tasks completed</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${analytics.completionRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Deadlines */}
      <div className="dashboard-section">
        <h2 className="section-title">Upcoming Deadlines</h2>
        {upcoming && upcoming.length > 0 ? (
          <div className="deadline-list">
            {upcoming.map((item) => (
              <div key={item._id} className={`deadline-card ${getUrgencyClass(item.dueDate)}`}>
                <div className="deadline-content">
                  <div className="deadline-title">{item.title}</div>
                  <div className="deadline-meta">
                    <span className="deadline-date">
                      {new Date(item.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                    <span className="deadline-badge">{formatDaysLeft(item.dueDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No upcoming deadlines</div>
        )}
      </div>

      {/* Task Table */}
      <div className="dashboard-section">
        <h2 className="section-title">All Tasks</h2>
        {tasks && tasks.length > 0 ? (
          <div className="task-table">
            <div className="table-header">
              <div className="table-cell">Task Name</div>
              <div className="table-cell">Category</div>
              <div className="table-cell">Due Date</div>
              <div className="table-cell">Action</div>
            </div>
            {tasks.map((task) => (
              <div key={task._id} className="table-row" onClick={() => setSelectedTask(task)}>
                <div className="table-cell task-name">{task.title}</div>
                <div className="table-cell">{task.category || "General"}</div>
                <div className="table-cell">
                  {new Date(task.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </div>
                <div className="table-cell">
                  <div className="action-cell">
                    {task.status?.toLowerCase() === "completed" ? (
                      <span className="btn-completed">✓ Completed</span>
                    ) : (
                      <>
                        {(userRole === "admin" || userRole === "manager" || userRole === "employee") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (taskEvidenceStatus[task._id]) {
                                handleCompleteTask(task._id);
                              } else {
                                setSelectedTask(task);
                              }
                            }}
                            disabled={completingTask === task._id}
                            className={taskEvidenceStatus[task._id] ? "btn-complete" : "btn-upload-evidence"}
                          >
                            {completingTask === task._id ? "Completing..." : taskEvidenceStatus[task._id] ? "Mark Complete" : "Upload Evidence"}
                          </button>
                        )}
                        <span className={`evidence-status ${taskEvidenceStatus[task._id] ? 'evidence-submitted' : 'evidence-not-submitted'}`}>
                          {taskEvidenceStatus[task._id] ? '✓' : '✗'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No tasks available</div>
        )}
      </div>

      {/* Recent Activity */}
      {(userRole === "admin" || userRole === "manager") && (
        <div className="dashboard-section">
          <h2 className="section-title">📋 Recent Activity</h2>
          <ActivityFeed />
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTask.title}</h2>
              <button className="modal-close" onClick={() => setSelectedTask(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Category</span>
                <span className="detail-value">{selectedTask.category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Due Date</span>
                <span className="detail-value">
                  {new Date(selectedTask.dueDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`status-badge ${getStatusClass(selectedTask.status)}`}>
                  {selectedTask.status || "Pending"}
                </span>
              </div>
              {selectedTask.description && (
                <div className="detail-section">
                  <h3>What to do</h3>
                  <p>{selectedTask.description}</p>
                </div>
              )}
              {selectedTask.reason && (
                <div className="detail-section">
                  <h3>Why this applies</h3>
                  <p>{selectedTask.reason}</p>
                </div>
              )}
              {selectedTask.status?.toLowerCase() !== "completed" && (userRole === "admin" || userRole === "manager" || userRole === "employee") && (
                <div className="detail-section">
                  <h3>Upload Evidence</h3>
                  <EvidenceUpload 
                    taskId={selectedTask._id} 
                    onUploadSuccess={async () => {
                      alert("Evidence uploaded successfully!");
                      // Refresh evidence status
                      const token = localStorage.getItem("token");
                      try {
                        const evidenceRes = await fetch(`${API_URL}/evidence/task/${selectedTask._id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        const evidenceData = await evidenceRes.json();
                        setTaskEvidenceStatus(prev => ({
                          ...prev,
                          [selectedTask._id]: evidenceData.length > 0
                        }));
                      } catch (err) {
                        console.error("Error refreshing evidence status:", err);
                      }
                    }}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedTask.status?.toLowerCase() !== "completed" && (userRole === "admin" || userRole === "manager" || userRole === "employee") && (
                <>
                  {taskEvidenceStatus[selectedTask._id] ? (
                    <>
                      <div className="evidence-badge-success">🟢 Evidence Submitted — Ready to Complete</div>
                      <button
                        onClick={() => {
                          handleCompleteTask(selectedTask._id);
                        }}
                        disabled={completingTask === selectedTask._id}
                        className="btn-complete"
                      >
                        {completingTask === selectedTask._id ? "Completing..." : "Mark Complete"}
                      </button>
                    </>
                  ) : (
                    <div className="evidence-badge-warning">🟡 Upload evidence to complete this task</div>
                  )}
                </>
              )}
              <button onClick={() => setSelectedTask(null)} className="btn-cancel-modal">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
