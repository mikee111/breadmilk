import React, { Component } from 'react';
import './UserDashboardSimple.css';

export default class UserDashboardSimple extends Component {
  constructor(props) {
    super(props);
    
    // Debug localStorage
    const userFromStorage = localStorage.getItem('user');
    console.log('UserDashboardSimple - Raw user from localStorage:', userFromStorage);
    
    let parsedUser = {};
    try {
      parsedUser = JSON.parse(userFromStorage || '{}');
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      parsedUser = {};
    }
    
    console.log('UserDashboardSimple - Parsed user:', parsedUser);
    console.log('UserDashboardSimple - User ID check:', parsedUser.id || parsedUser.user_id || parsedUser.userId);
    
    // Normalize user ID field (different login systems might use different field names)
    if (parsedUser && !parsedUser.id) {
      if (parsedUser.user_id) {
        parsedUser.id = parsedUser.user_id;
      } else if (parsedUser.userId) {
        parsedUser.id = parsedUser.userId;
      }
    }
    
    // If no valid user found, create a default test user immediately
    if (!parsedUser || !parsedUser.id) {
      parsedUser = {
        id: 2, // Use ID 2 instead of 1 to avoid conflicts
        email: 'test@breadmilk.com',
        username: 'testuser',
        firstname: 'Test',
        lastname: 'User',
        role: 'User',
        status: 'Active'
      };
      localStorage.setItem('user', JSON.stringify(parsedUser));
      console.log('Created default test user:', parsedUser);
      
      // Also try to create this user in the database
      this.createUserInDatabase(parsedUser);
    }
    
    this.state = {
      user: parsedUser,
      activeTab: 'overview',
      inventoryItems: [],
      userRequests: [],
      searchTerm: '',
      selectedCategory: 'all',
      categories: [],
      requestForm: {
        item_id: '',
        quantity: 1,
        note: ''
      },
      isLoading: false,
      notification: null,
      lastSyncTime: new Date(), // Track last sync with admin
      isConnected: true // Connection status indicator
    };
  }

  componentDidMount() {
    this.loadDashboardData();
    
    // Set up auto-refresh to sync with admin changes every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 30000);
    
    // Listen for storage changes (when admin makes changes)
    window.addEventListener('storage', this.handleStorageChange);
  }

  componentWillUnmount() {
    // Clean up intervals and event listeners
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange);
  }

  handleStorageChange = (e) => {
    // Reload data when localStorage changes (admin updates)
    if (e.key === 'inventory_updated' || e.key === 'users_updated') {
      this.loadDashboardData();
      this.showNotification('Data updated by admin', 'success');
    }
  }

  async loadDashboardData() {
    this.setState({ isLoading: true });
    
    // Auto-login user if not logged in
    this.autoLoginUser();
    
    try {
      await Promise.all([
        this.loadInventoryItems(),
        this.loadCategories(),
        this.loadUserRequests()
      ]);
      
      // Update sync time and connection status
      this.setState({ 
        lastSyncTime: new Date(),
        isConnected: true 
      });
    } catch (error) {
      this.showNotification('Error loading dashboard data', 'error');
      this.setState({ isConnected: false });
    } finally {
      this.setState({ isLoading: false });
    }
  }

  autoLoginUser = () => {
    let user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!user) {
      // Create default user with ID 2 (will be auto-created in database)
      user = {
        id: 2,
        email: 'user@breadmilk.com',
        username: 'defaultuser',
        firstname: 'Default',
        lastname: 'User',
        role: 'User',
        status: 'Active'
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      console.log('✅ Auto-logged in as user:', user);
    }
    
    // Update state
    this.setState({ user });
  }

  async loadInventoryItems() {
    try {
      console.log('📦 Loading inventory items...');
      const response = await fetch('http://localhost:5000/api/inventory/items');
      if (response.ok) {
        const items = await response.json();
        console.log('📦 Raw inventory items:', items);
        
        // Normalize field names for consistency
        const normalizedItems = items.map(item => ({
          item_id: item.item_id || item.id,
          item_name: item.item_name || item.name,
          quantity: parseInt(item.quantity) || 0,
          price: parseFloat(item.price) || 0,
          category: item.category || 'Uncategorized',
          // Keep original item for reference
          ...item
        }));
        
        console.log('📦 Normalized inventory items:', normalizedItems);
        this.setState({ inventoryItems: normalizedItems });
      } else {
        console.error('❌ Failed to load inventory:', response.status);
        this.setState({ inventoryItems: [] });
      }
    } catch (error) {
      console.error('❌ Error loading inventory:', error);
      this.setState({ inventoryItems: [] });
    }
  }

  async loadCategories() {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (response.ok) {
        const categories = await response.json();
        this.setState({ categories });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async loadUserRequests() {
    try {
      const { user } = this.state;
      const userId = user?.id || user?.user_id || user?.userId;
      
      if (!user || !userId) {
        console.log('⚠️ No valid user ID available for loading requests');
        this.setState({ userRequests: [] });
        return;
      }

      console.log('📋 Loading requests for user ID:', userId);
      const response = await fetch(`http://localhost:5000/api/requests/user/${userId}`);
      
      console.log('📥 Load requests response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📋 Load requests result:', result);
        
        // Handle both formats: direct array or {success: true, data: array}
        let requests = [];
        if (result.success && Array.isArray(result.data)) {
          requests = result.data;
        } else if (Array.isArray(result)) {
          requests = result;
        }
        
        console.log('✅ Loaded user requests:', requests);
        this.setState({ userRequests: requests });
      } else {
        console.error('❌ Failed to load user requests:', response.status);
        this.setState({ userRequests: [] });
      }
    } catch (error) {
      console.error('❌ Error loading user requests:', error);
      this.setState({ userRequests: [] });
    }
  }

  showNotification = (message, type = 'success') => {
    this.setState({ 
      notification: { message, type } 
    });
    setTimeout(() => {
      this.setState({ notification: null });
    }, 3000);
  }

  handleRequestSubmit = async (e) => {
    e.preventDefault();
    const { requestForm, user } = this.state;
    
    // Debug logging
    console.log('🔍 Submitting request:', { requestForm, user });
    console.log('📋 Request form data:', requestForm);
    console.log('👤 User object detailed:', {
      id: user?.id,
      user_id: user?.user_id,
      userId: user?.userId,
      email: user?.email,
      username: user?.username,
      firstname: user?.firstname
    });
    
    // Enhanced validation
    if (!requestForm.item_id || requestForm.item_id === '') {
      this.showNotification('❌ Please select an item', 'error');
      return;
    }
    
    if (!requestForm.quantity || requestForm.quantity <= 0) {
      this.showNotification('❌ Please enter a valid quantity', 'error');
      return;
    }

    // Get user ID from different possible field names
    const userId = user?.id || user?.user_id || user?.userId;
    console.log('🔑 Extracted User ID:', userId);
    
    if (!user || !userId) {
      console.error('❌ User validation failed. User object:', user);
      console.error('❌ User ID not found. Available fields:', Object.keys(user || {}));
      
      // Create a valid user in the database first
      this.showNotification('🔧 Setting up user account...', 'success');
      
      // Create a default user object
      const defaultUser = {
        id: 1,
        email: 'user@breadmilk.com',
        username: 'defaultuser',
        firstname: 'Default',
        lastname: 'User',
        role: 'User',
        status: 'Active'
      };
      
      // Save to localStorage and update state
      localStorage.setItem('user', JSON.stringify(defaultUser));
      this.setState({ user: defaultUser });
      
      // Create user in database
      await this.createUserInDatabase(defaultUser);
      
      this.showNotification('✅ User account set up! Please try submitting again.', 'success');
      return;
    }

    try {
      // Ensure item_id is properly converted to integer
      const itemId = parseInt(requestForm.item_id);
      const quantity = parseInt(requestForm.quantity);
      
      if (isNaN(itemId) || isNaN(quantity)) {
        this.showNotification('❌ Invalid item or quantity selected', 'error');
        return;
      }
      
      const requestData = {
        user_id: userId,
        item_id: itemId,
        quantity: quantity,
        note: requestForm.note || ''
      };
      
      console.log('📤 Request data being sent:', requestData);
      console.log('🌐 Sending to URL:', 'http://localhost:5000/api/requests');

      const response = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      
      const responseData = await response.json();
      console.log('📥 Server response data:', responseData);

      if (response.ok && responseData.success) {
        this.showNotification('✅ Request submitted successfully!', 'success');
        this.setState({
          requestForm: { item_id: '', quantity: 1, note: '' },
          activeTab: 'requests'
        });
        await this.loadUserRequests();
      } else {
        const errorMessage = responseData.message || responseData.error || 'Failed to submit request';
        this.showNotification(`❌ ${errorMessage}`, 'error');
        console.error('❌ Request failed:', responseData);
      }
    } catch (error) {
      console.error('❌ Request submission error:', error);
      this.showNotification('❌ Network error: Cannot connect to server. Please check if the server is running.', 'error');
    }
  }

  createTestUser = async () => {
    try {
      this.showNotification('Creating test user...', 'success');
      
      const response = await fetch('http://localhost:5000/api/test-users/makel-luna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Test user response:', data);
        
        // Create user object with proper structure
        const testUser = {
          id: data.id || 1,
          email: data.credentials?.email || 'test@example.com',
          username: data.credentials?.username || 'testuser',
          firstname: 'Test',
          lastname: 'User',
          role: 'User',
          status: 'Active'
        };
        
        // Save to localStorage and update state
        localStorage.setItem('user', JSON.stringify(testUser));
        this.setState({ user: testUser });
        
        this.showNotification('✅ Test user created! You can now make requests.', 'success');
        this.loadDashboardData(); // Refresh data
      } else {
        this.showNotification('Failed to create test user', 'error');
      }
    } catch (error) {
      console.error('Error creating test user:', error);
      this.showNotification('Error creating test user', 'error');
    }
  }

  createUserInDatabase = async (user) => {
    try {
      console.log('Creating user in database:', user);
      
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          password: 'test123', // Default password
          role: user.role,
          status: user.status
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ User created in database:', result);
        
        // Update the user ID with the actual database ID
        if (result.data && result.data.id) {
          const updatedUser = { ...user, id: result.data.id };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.setState({ user: updatedUser });
        }
      } else {
        console.log('User might already exist or database error');
      }
    } catch (error) {
      console.error('Error creating user in database:', error);
    }
  }

  testConnection = async () => {
    try {
      console.log('🔍 Testing server connection...');
      const response = await fetch('http://localhost:5000/api/test');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Server test response:', data);
        this.showNotification('✅ Server connection working!', 'success');
      } else {
        console.error('❌ Server test failed:', response.status);
        this.showNotification('❌ Server connection failed', 'error');
      }
    } catch (error) {
      console.error('❌ Connection test error:', error);
      this.showNotification('❌ Cannot reach server', 'error');
    }
  }

  debugRequestData = () => {
    const { requestForm, user, inventoryItems } = this.state;
    console.log('🐛 === REQUEST DEBUG INFO ===');
    console.log('📋 Request Form:', requestForm);
    console.log('👤 User Data:', user);
    console.log('📦 Available Items:', inventoryItems);
    console.log('🔑 User ID:', user?.id || user?.user_id || user?.userId);
    console.log('📋 Selected Item ID:', requestForm.item_id);
    console.log('🔢 Request Quantity:', requestForm.quantity);
    console.log('📝 Request Note:', requestForm.note);
    
    // Find the selected item
    const selectedItem = inventoryItems.find((item) => (
      item.item_id === requestForm.item_id || item.id === requestForm.item_id
    ));
    console.log('🎯 Selected Item Details:', selectedItem);
    
    // Test server connection immediately
    this.testServerAndSubmit();
    
    this.showNotification('🐛 Debug info logged to console', 'success');
  }

  testServerAndSubmit = async () => {
    try {
      console.log('🔍 Testing server before submitting request...');
      
      // Test basic connection
      const testResponse = await fetch('http://localhost:5000/api/test');
      if (!testResponse.ok) {
        throw new Error('Server connection failed');
      }
      
      const testData = await testResponse.json();
      console.log('✅ Server test successful:', testData);
      
      // Test inventory endpoint
      const inventoryResponse = await fetch('http://localhost:5000/api/inventory/items');
      const inventory = await inventoryResponse.json();
      console.log('📦 Current inventory:', inventory);
      
      // If no inventory, create a test item
      if (!inventory || inventory.length === 0) {
        console.log('⚠️ No inventory found, creating test item...');
        const addItemResponse = await fetch('http://localhost:5000/api/inventory/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item_name: 'Test Bread',
            quantity: 100,
            price: 50,
            category: 'Bread'
          })
        });
        
        if (addItemResponse.ok) {
          console.log('✅ Test item created');
          await this.loadInventoryItems(); // Refresh inventory
        }
      }
      
      this.showNotification('🔧 Server test completed - check console for details', 'success');
      
    } catch (error) {
      console.error('❌ Server test failed:', error);
      this.showNotification('❌ Server test failed: ' + error.message, 'error');
    }
  }

  handleLogout = () => {
    // Clear all user data
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    
    // Show logout message
    this.showNotification('Logged out successfully', 'success');
    
    // Redirect after a brief delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }

  getFilteredItems = () => {
    const { inventoryItems, searchTerm, selectedCategory } = this.state;
    const safeInventoryItems = Array.isArray(inventoryItems) ? inventoryItems : [];
    return safeInventoryItems.filter(item => {
      const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory && item.quantity > 0;
    });
  }

  getLowStockItems = () => {
    const { inventoryItems } = this.state;
    const safeInventoryItems = Array.isArray(inventoryItems) ? inventoryItems : [];
    return safeInventoryItems.filter(item => item.quantity <= 10 && item.quantity > 0);
  }

  getOutOfStockItems = () => {
    const { inventoryItems } = this.state;
    const safeInventoryItems = Array.isArray(inventoryItems) ? inventoryItems : [];
    return safeInventoryItems.filter(item => item.quantity === 0);
  }

  renderOverview() {
    const { inventoryItems, userRequests } = this.state;
    
    // Ensure arrays are properly initialized
    const safeInventoryItems = Array.isArray(inventoryItems) ? inventoryItems : [];
    const safeUserRequests = Array.isArray(userRequests) ? userRequests : [];
    
    // totalItems kept for future use (e.g., KPI card / export)
    const availableItems = safeInventoryItems.filter(item => item.quantity > 0).length;
    const lowStockItems = this.getLowStockItems();
    const pendingRequests = safeUserRequests.filter(req => req.status === 'pending').length;
    const recentRequests = safeUserRequests.slice(0, 5);

    return (
      <div className="overview-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{availableItems}</h3>
              <p>Available Items</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <h3>{lowStockItems.length}</h3>
              <p>Low Stock Alert</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🕐</div>
            <div className="stat-info">
              <h3>{pendingRequests}</h3>
              <p>Pending Requests</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{safeUserRequests.length}</h3>
              <p>Total Requests</p>
            </div>
          </div>
        </div>

        {lowStockItems.length > 0 && (
          <div className="notification-section">
            <h3>🔔 Low Stock Notifications</h3>
            <div className="notification-list">
              {lowStockItems.map(item => (
                <div key={item.item_id} className="notification-item low-stock">
                  <span className="item-name">{item.item_name}</span>
                  <span className="item-quantity">Only {item.quantity} left</span>
                  <span className="item-category">{item.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="recent-activity">
          <h3>📋 Recent Requests</h3>
          {recentRequests.length > 0 ? (
            <div className="activity-list">
              {recentRequests.map(request => (
                <div key={request.id} className="activity-item">
                  <div className="activity-info">
                    <span className="activity-text">
                      Requested {request.quantity}x {request.item_name}
                    </span>
                    <span className="activity-date">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`status-badge ${request.status}`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent requests</p>
          )}
        </div>
      </div>
    );
  }

  renderInventory() {
    const { searchTerm, selectedCategory, categories } = this.state;
    const filteredItems = this.getFilteredItems();

    return (
      <div className="inventory-content">
        <div className="inventory-header-section">
          <h3>📦 View Inventory</h3>
          <p className="section-subtitle">Browse all available products and make requests.</p>
        </div>

        <div className="inventory-controls-enhanced">
          <div className="search-bar-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => this.setState({ searchTerm: e.target.value })}
              className="search-input-modern"
            />
          </div>
          
          <div className="category-filter-container">
            <span className="filter-label">Filter by Category:</span>
            <div className="category-chips">
              <button 
                className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => this.setState({ selectedCategory: 'all' })}
              >
                All Items
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.category_id || cat.id} 
                  className={`category-chip ${selectedCategory === cat.name ? 'active' : ''}`}
                  onClick={() => this.setState({ selectedCategory: cat.name })}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="items-grid">
          {filteredItems.map(item => (
            <div key={item.item_id} className="item-card-modern">
              <div className="item-badge">{item.category}</div>
              <div className="item-card-header">
                <h4>{item.item_name}</h4>
              </div>
              
              <div className="item-card-body">
                <div className="item-stock-info">
                  <span className="label">Available Stock:</span>
                  <span className={`value ${item.quantity <= 10 ? 'low-stock' : 'in-stock'}`}>
                    {item.quantity} units
                  </span>
                </div>
                <div className="item-price-tag">₱{parseFloat(item.price).toFixed(2)}</div>
              </div>
              
              <div className="item-card-footer">
                <button
                  className="request-btn-modern"
                  onClick={() => this.setState({
                    activeTab: 'request',
                    requestForm: { ...this.state.requestForm, item_id: item.item_id }
                  })}
                  disabled={item.quantity === 0}
                >
                  {item.quantity === 0 ? 'Out of Stock' : 'Request This Item'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="no-items-found">
            <div className="no-items-icon">🔎</div>
            <h4>No items found</h4>
            <p>We couldn't find any items matching your current filters.</p>
            <button 
              className="reset-filter-btn"
              onClick={() => this.setState({ searchTerm: '', selectedCategory: 'all' })}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    );
  }

  renderRequestForm() {
    const { requestForm, inventoryItems } = this.state;
    const availableItems = inventoryItems.filter(item => item.quantity > 0);

    console.log('🔍 renderRequestForm - availableItems:', availableItems);
    console.log('🔍 renderRequestForm - current requestForm:', requestForm);

    return (
      <div className="request-content">
        <div className="request-form-container">
          <h3>📝 Request Item</h3>
          
          <form onSubmit={this.handleRequestSubmit} className="request-form">
            <div className="form-group">
              <label>Select Item</label>
              <select
                value={requestForm.item_id}
                onChange={(e) => {
                  console.log('🔍 Item selected:', e.target.value);
                  this.setState({
                    requestForm: { ...requestForm, item_id: e.target.value }
                  });
                }}
                required
              >
                <option value="">Choose an item...</option>
                {availableItems.map(item => {
                  // Handle different field name possibilities
                  const itemId = item.item_id || item.id;
                  const itemName = item.item_name || item.name;
                  const itemQuantity = item.quantity;
                  
                  console.log('🔍 Mapping item:', { itemId, itemName, itemQuantity, originalItem: item });
                  
                  return (
                    <option key={itemId} value={itemId}>
                      {itemName} - Available: {itemQuantity}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={requestForm.quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 1;
                  console.log('🔍 Quantity changed:', newQuantity);
                  this.setState({
                    requestForm: { ...requestForm, quantity: newQuantity }
                  });
                }}
                required
              />
            </div>

            <div className="form-group">
              <label>Note (Optional)</label>
              <textarea
                placeholder="Add any additional notes..."
                value={requestForm.note}
                onChange={(e) => this.setState({
                  requestForm: { ...requestForm, note: e.target.value }
                })}
                rows="3"
              />
            </div>

            <button type="submit" className="submit-btn">
              Submit Request
            </button>
          </form>
        </div>
      </div>
    );
  }

  renderRequests() {
    const { userRequests } = this.state;
    const safeUserRequests = Array.isArray(userRequests) ? userRequests : [];

    return (
      <div className="requests-content">
        <h3>📋 My Requests</h3>
        
        {safeUserRequests.length > 0 ? (
          <div className="requests-list">
            {safeUserRequests.map(request => (
              <div key={request.id} className="request-item">
                <div className="request-header">
                  <h4>{request.item_name}</h4>
                  <span className={`status-badge ${request.status}`}>
                    {request.status}
                  </span>
                </div>
                
                <div className="request-details">
                  <div className="detail-item">
                    <span className="label">Quantity:</span>
                    <span className="value">{request.quantity}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Requested:</span>
                    <span className="value">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {request.note && (
                    <div className="detail-item note">
                      <span className="label">Note:</span>
                      <span className="value">{request.note}</span>
                    </div>
                  )}
                  
                  {request.admin_response && (
                    <div className="detail-item response">
                      <span className="label">Admin Response:</span>
                      <span className="value">{request.admin_response}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-requests">
            <p>You haven't made any requests yet.</p>
            <button
              className="start-request-btn"
              onClick={() => this.setState({ activeTab: 'request' })}
            >
              Make Your First Request
            </button>
          </div>
        )}
      </div>
    );
  }

  renderProfile() {
    const { user } = this.state;
    const userId = user?.id || user?.user_id || user?.userId;

    return (
      <div className="profile-content">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              {(user.firstname || user.username || user.email)?.charAt(0)?.toUpperCase()}
            </div>
            <div className="profile-info">
              <h3>{user.firstname} {user.lastname}</h3>
              <p>{user.email}</p>
              <span className="user-role">{user.role}</span>
            </div>
          </div>

          {/* Debug Section */}
          <div className="debug-section">
            <h4>🔧 Debug Information</h4>
            <div className="debug-info">
              <p><strong>User ID:</strong> {userId || 'Not found'}</p>
              <p><strong>Raw User Object:</strong></p>
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-group">
              <label>Email</label>
              <div className="detail-value">{user.email}</div>
            </div>
            
            <div className="detail-group">
              <label>Username</label>
              <div className="detail-value">{user.username || 'Not set'}</div>
            </div>
            
            <div className="detail-group">
              <label>Full Name</label>
              <div className="detail-value">
                {`${user.firstname || ''} ${user.middlename || ''} ${user.lastname || ''}`.trim() || 'Not set'}
              </div>
            </div>
            
            <div className="detail-group">
              <label>Role</label>
              <div className="detail-value">{user.role}</div>
            </div>
            
            <div className="detail-group">
              <label>Status</label>
              <div className="detail-value">
                <span className={`status-badge ${user.status?.toLowerCase()}`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="edit-profile-btn">
              Edit Profile
            </button>
            <button className="change-password-btn">
              Change Password
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { activeTab, user, isLoading, notification } = this.state;

    // More detailed logging for debugging
    console.log('UserDashboardSimple render - user object:', user);
    console.log('UserDashboardSimple render - user keys:', Object.keys(user || {}));
    
    // Check if user is logged in - more robust check
    const isLoggedIn = user && (user.id || user.email || user.username);
    console.log('UserDashboardSimple render - isLoggedIn:', isLoggedIn);
    
    if (!isLoggedIn) {
      return (
        <div className="login-required">
          <h3>Please log in to access your dashboard</h3>
          <p>Debug: User object is {user ? 'present but incomplete' : 'missing'}</p>
          <button onClick={() => window.location.href = '/login'}>
            Go to Login
          </button>
        </div>
      );
    }

    return (
      <div className="user-dashboard-simple">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="dashboard-header">
          <div className="header-left">
            <h1>🍞 Breadmilk Dashboard</h1>
            <p>Welcome back, {this.state.user && this.state.user.firstname ? this.state.user.firstname : (this.state.user && this.state.user.username ? this.state.user.username : 'User')}!</p>
          </div>
          
          <div className="header-center">
            <div className={`sync-indicator ${this.state.isConnected ? 'connected' : 'disconnected'}`}>
              <span className="sync-icon">{this.state.isConnected ? '🟢' : '🔴'}</span>
              <span className="sync-text">
                {this.state.isConnected ? 'Connected' : 'Disconnected'}
              </span>
              <span className="sync-time">
                Last sync: {this.state.lastSyncTime.toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="header-right">
            <button className="create-user-btn" onClick={() => this.createTestUser()}>
              👤 Create Test User
            </button>
            <button className="test-btn" onClick={() => this.testConnection()}>
              🔧 Test Server
            </button>
            <button className="debug-btn" onClick={() => this.debugRequestData()}>
              🐛 Debug Request
            </button>
            <button className="refresh-btn" onClick={() => this.loadDashboardData()}>
              🔄 Refresh
            </button>
            <button className="logout-btn" onClick={this.handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-container">
          <nav className="dashboard-nav">
            <button
              className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => this.setState({ activeTab: 'overview' })}
            >
              <span className="nav-icon">📊</span>
              Overview
            </button>
            
            <button
              className={`nav-btn ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => this.setState({ activeTab: 'inventory' })}
            >
              <span className="nav-icon">📦</span>
              View Inventory
            </button>
            
            <button
              className={`nav-btn ${activeTab === 'request' ? 'active' : ''}`}
              onClick={() => this.setState({ activeTab: 'request' })}
            >
              <span className="nav-icon">📝</span>
              Request Item
            </button>
            
            <button
              className={`nav-btn ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => this.setState({ activeTab: 'requests' })}
            >
              <span className="nav-icon">📋</span>
              My Requests
            </button>
            
            <button
              className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => this.setState({ activeTab: 'profile' })}
            >
              <span className="nav-icon">👤</span>
              Profile
            </button>
          </nav>

          <main className="dashboard-main">
            {isLoading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && this.renderOverview()}
                {activeTab === 'inventory' && this.renderInventory()}
                {activeTab === 'request' && this.renderRequestForm()}
                {activeTab === 'requests' && this.renderRequests()}
                {activeTab === 'profile' && this.renderProfile()}
              </>
            )}
          </main>
        </div>
      </div>
    );
  }
}
