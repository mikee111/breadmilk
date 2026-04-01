import React, { Component } from 'react';
import './AdminRequestsManager.css';

export default class AdminRequestsManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requests: [],
      filteredRequests: [],
      statusFilter: 'all',
      searchTerm: '',
      isLoading: false,
      notification: null,
      stats: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      }
    };
  }

  componentDidMount() {
    this.loadRequests();
    this.loadStats();
  }

  async loadRequests() {
    this.setState({ isLoading: true });
    try {
      const response = await fetch('http://localhost:5000/api/requests');
      if (response.ok) {
        const result = await response.json();
        const requests = result.data || [];
        this.setState({ 
          requests,
          filteredRequests: requests
        });
        this.applyFilters();
      } else {
        this.showNotification('Failed to load requests', 'error');
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      this.showNotification('Error loading requests', 'error');
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async loadStats() {
    try {
      const response = await fetch('http://localhost:5000/api/requests/stats');
      if (response.ok) {
        const result = await response.json();
        this.setState({ stats: result.data });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  showNotification = (message, type = 'success') => {
    this.setState({ notification: { message, type } });
    setTimeout(() => {
      this.setState({ notification: null });
    }, 3000);
  }

  applyFilters = () => {
    const { requests, statusFilter, searchTerm } = this.state;
    
    let filtered = requests.filter(request => {
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesSearch = 
        request.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${request.firstname} ${request.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user_email.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });

    this.setState({ filteredRequests: filtered });
  }

  handleFilterChange = (field, value) => {
    this.setState({ [field]: value }, () => {
      this.applyFilters();
    });
  }

  async handleStatusUpdate(requestId, newStatus, adminResponse = '') {
    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          admin_response: adminResponse
        })
      });

      if (response.ok) {
        this.showNotification(`Request ${newStatus} successfully!`);
        this.loadRequests();
        this.loadStats();
      } else {
        const result = await response.json();
        this.showNotification(result.message || 'Failed to update request', 'error');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      this.showNotification('Error updating request', 'error');
    }
  }

  handleQuickApprove = (request) => {
    if (window.confirm(`Approve request for ${request.quantity}x ${request.item_name} by ${request.firstname} ${request.lastname}?`)) {
      this.handleStatusUpdate(request.id, 'approved', 'Request approved automatically');
    }
  }

  handleQuickReject = (request) => {
    const reason = prompt(`Reject request for ${request.quantity}x ${request.item_name}?\n\nPlease provide a reason:`);
    if (reason !== null) {
      this.handleStatusUpdate(request.id, 'rejected', reason || 'Request rejected');
    }
  }

  renderStats() {
    const { stats } = this.state;
    
    return (
      <div className="stats-section">
        <h3>📊 Request Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Requests</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-number">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-number">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
      </div>
    );
  }

  renderFilters() {
    const { statusFilter, searchTerm } = this.state;
    
    return (
      <div className="filters-section">
        <div className="filter-group">
          <label>Status Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => this.handleFilterChange('statusFilter', e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by item, user name, or email..."
            value={searchTerm}
            onChange={(e) => this.handleFilterChange('searchTerm', e.target.value)}
          />
        </div>
        
        <button onClick={() => this.loadRequests()} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>
    );
  }

  renderRequestsList() {
    const { filteredRequests, isLoading } = this.state;
    
    if (isLoading) {
      return (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading requests...</p>
        </div>
      );
    }
    
    if (filteredRequests.length === 0) {
      return (
        <div className="no-requests">
          <p>No requests found matching your criteria.</p>
        </div>
      );
    }
    
    return (
      <div className="requests-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(request => (
              <tr key={request.id}>
                <td>
                  <div className="user-info">
                    <div className="user-name">{request.firstname} {request.lastname}</div>
                    <div className="user-email">{request.user_email}</div>
                  </div>
                </td>
                <td>
                  <div className="item-info">
                    <div className="item-name">{request.item_name}</div>
                    {request.note && (
                      <div className="item-note">Note: {request.note}</div>
                    )}
                  </div>
                </td>
                <td className="quantity">{request.quantity}</td>
                <td>
                  <span className={`status-badge ${request.status}`}>
                    {request.status}
                  </span>
                </td>
                <td className="date">
                  {new Date(request.created_at).toLocaleDateString()}
                </td>
                <td>
                  <div className="actions">
                    {request.status === 'pending' && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => this.handleQuickApprove(request)}
                        >
                          ✅ Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => this.handleQuickReject(request)}
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                    {request.status !== 'pending' && request.admin_response && (
                      <div className="admin-response">
                        <small>Response: {request.admin_response}</small>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    const { notification } = this.state;
    
    return (
      <div className="admin-requests-manager">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        <div className="manager-header">
          <h2>🔔 User Requests Management</h2>
          <p>Manage and respond to user item requests</p>
        </div>
        
        {this.renderStats()}
        {this.renderFilters()}
        {this.renderRequestsList()}
      </div>
    );
  }
}
