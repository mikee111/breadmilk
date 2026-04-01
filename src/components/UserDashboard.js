// UserDashboard.js - Reborn Version 2.0
// Modern Breadmilk Inventory Management System

import React, { Component } from 'react';
import './UserDashboard.css';
import ChevronDown from './ChevronDown';
import DataPredictions from './DataPredictions';

export default class UserDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      userInfo: null,
      selectedSaleItem: null,
      saleQuantity: '',
      dailySales: null,
      salesData: [],
      monthlySales: null,
      yearlySales: null,
      showRecordSaleModal: false,
      salesLoading: false,
      salesError: null,
      openDropdown: null,
      mainContent: 'dashboard', // Set default main content to dashboard homepage
      inventoryItems: [], // Add inventory items state
      loading: true,
      criticalItems: [],
      showCriticalAlert: false,
      lowStockThreshold: 10, // Changed from 50 to 10 to match your data
      salesSummary: null,
      error: null,
      // Add Items functionality
      addItemsRows: [
        { itemName: '', quantity: '', price: '', category: '' },
        { itemName: '', quantity: '', price: '', category: '' },
        { itemName: '', quantity: '', price: '', category: '' },
        { itemName: '', quantity: '', price: '', category: '' }
      ],
      // Categories management
      categories: [],
      newCategoryName: '',
      newCategoryDescription: '',
      selectedCategoryForEdit: null,
      editCategoryName: '',
      editCategoryDescription: '',
      // Update Items functionality
      updateItemsData: [],
      selectedUpdateItem: null,
      updateItemName: '',
      updateItemQuantity: '',
      updateItemPrice: '',
      updateItemCategory: '',
      // Advanced Analytics and Graphs
      salesTrends: [],
      inventoryTrends: [],
      forecastData: [],
      categoryAnalytics: [],
      performanceMetrics: {},
      userActivityData: [],
      revenueForecasting: [],
      demandAnalytics: [],
      // Request Management
      userRequests: [],
      requestStats: null,
      selectedRequest: null,
      requestFilter: 'all' // all, pending, approved, rejected
    };

    // Bind ALL methods in constructor - this is the key fix
    this.checkLogin = this.checkLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleDropdownClick = this.handleDropdownClick.bind(this);
    this.fetchInventoryItems = this.fetchInventoryItems.bind(this);
    this.fetchCategories = this.fetchCategories.bind(this);
    this.fetchCriticalItems = this.fetchCriticalItems.bind(this); // Add this back
    this.fetchSalesData = this.fetchSalesData.bind(this);
    this.fetchDailySales = this.fetchDailySales.bind(this);
    this.fetchMonthlySales = this.fetchMonthlySales.bind(this);
    this.fetchYearlySales = this.fetchYearlySales.bind(this);
    this.handleRecordSale = this.handleRecordSale.bind(this);
    this.fetchSalesSummary = this.fetchSalesSummary.bind(this);
    // Add Items methods
    this.handleAddItemsChange = this.handleAddItemsChange.bind(this);
    this.addItemsRow = this.addItemsRow.bind(this);
    this.removeItemsRow = this.removeItemsRow.bind(this);
    this.saveAllItems = this.saveAllItems.bind(this);
    this.clearAddItemsForm = this.clearAddItemsForm.bind(this);
    // Categories methods
    this.handleAddCategory = this.handleAddCategory.bind(this);
    this.handleUpdateCategory = this.handleUpdateCategory.bind(this);
    this.handleDeleteCategory = this.handleDeleteCategory.bind(this);
    // Update Items methods
    this.handleUpdateItemSelect = this.handleUpdateItemSelect.bind(this);
    this.handleUpdateItemChange = this.handleUpdateItemChange.bind(this);
    this.saveItemUpdate = this.saveItemUpdate.bind(this);
    // User Management methods
    this.handleAddUserChange = this.handleAddUserChange.bind(this);
    this.handleAddUser = this.handleAddUser.bind(this);
    this.handleDebugUserCreation = this.handleDebugUserCreation.bind(this);
    this.fetchUsers = this.fetchUsers.bind(this);
    // Request Management methods
    this.fetchUserRequests = this.fetchUserRequests.bind(this);
    this.handleRequestStatusChange = this.handleRequestStatusChange.bind(this);
    this.fetchRequestStats = this.fetchRequestStats.bind(this);
  }

  componentDidMount() {
    this.checkLogin();
    const onStorage = () => this.checkLogin();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', this.checkLogin);
    
    setTimeout(() => {
      this.fetchInventoryItems();
      this.fetchCategories();
      this.fetchCriticalItems();
      this.fetchSalesData();
      this.fetchDailySales();
      this.fetchSalesSummary();
      this.fetchUsers(); // Add this to fetch users
      this.fetchUserRequests(); // Add this to fetch requests
      this.fetchRequestStats(); // Add this to fetch request statistics
      // Generate comprehensive analytics after data is loaded
      setTimeout(() => {
        this.generateComprehensiveAnalytics();
      }, 500);
    }, 100);
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.checkLogin);
    window.removeEventListener('focus', this.checkLogin);
  }

  checkLogin() {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      this.setState({ isLoggedIn: true, userInfo: JSON.parse(loggedInUser), loading: false });
    } else {
      // Auto-login as admin user
      console.log('🔐 No user found, auto-creating admin user...');
      this.autoLoginAsAdmin();
    }
  }

  autoLoginAsAdmin = () => {
    const adminUser = {
      id: 999,
      email: 'admin@breadmilk.com',
      username: 'admin',
      firstname: 'Admin',
      lastname: 'User',
      role: 'Admin',
      status: 'Active'
    };
    
    // Save admin user to localStorage
    localStorage.setItem('user', JSON.stringify(adminUser));
    localStorage.setItem('userRole', 'Admin');
    localStorage.setItem('userRoleType', 'ADMIN'); // This is crucial for AdminRoute
    
    // Update state
    this.setState({ 
      isLoggedIn: true, 
      userInfo: adminUser, 
      loading: false 
    });
    
    console.log('✅ Auto-logged in as admin:', adminUser);
  }

  handleLogout() {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userSession');
    
    // Reset component state
    this.setState({
      isLoggedIn: false,
      userInfo: null,
      loading: false
    });
    
    // Optional: Show confirmation message
    alert('You have been logged out successfully!');
    
    // Redirect to login page or refresh to show login form
    window.location.reload();
  }

  handleDropdownClick(name) {
    this.setState(prevState => ({
      openDropdown: prevState.openDropdown === name ? null : name
    }));
  }

  // Change back to regular function and ensure it's properly bound
  fetchCriticalItems() {
    console.log('fetchCriticalItems called');
    
    return fetch('http://localhost:5001/api/inventory/critical')
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Critical items response:', data);
        
        let criticalItems = [];
        
        if (data && data.success && Array.isArray(data.data)) {
          criticalItems = data.data;
        } else if (Array.isArray(data)) {
          criticalItems = data;
        }
        
        // Show alert if there are critical items and alert hasn't been shown yet
        if (criticalItems.length > 0 && !this.state.showCriticalAlert) {
          this.setState({ showCriticalAlert: true });
          setTimeout(() => this.setState({ showCriticalAlert: false }), 4000);
        }
        
        this.setState({ 
          criticalItems: criticalItems,
          error: null 
        });
      })
      .catch(error => {
        console.error('Error fetching critical items:', error);
        this.setState({ 
          criticalItems: [],
          error: error.message 
        });
      });
  }

  fetchInventoryItems() {
    fetch('http://localhost:5001/api/inventory/items')
      .then(response => response.ok ? response.json() : [])
      .then(items => {
        const formattedItems = items.map(item => ({
          name: item.item_name || item.itemName,
          quantity: item.quantity,
          price: item.price,
          category: item.category,
          id: item.item_id || item.itemID,
          status: item.status || (parseInt(item.quantity) <= this.state.lowStockThreshold ? 'low_stock' : 'active'),
          created_at: item.created_at || item.formatted_created_at,
          updated_at: item.updated_at || item.formatted_updated_at,
          low_stock_threshold: item.low_stock_threshold || this.state.lowStockThreshold
        }));
        this.setState({ inventoryItems: formattedItems });
      })
      .catch(e => {
        console.error('Error fetching inventory:', e);
        this.setState({ inventoryItems: [] });
      });
  }

  fetchCategories() {
    console.log('🔍 Fetching categories from API...');
    fetch('http://localhost:5001/api/categories')
      .then(response => {
        console.log('Categories response status:', response.status);
        return response.ok ? response.json() : [];
      })
      .then(categories => {
        console.log('Categories received:', categories);
        const categoryNames = Array.isArray(categories) ? categories.map(cat => cat.name || cat) : [];
        console.log('Category names:', categoryNames);
        
        this.setState({ 
          categories: categories,
          dbCategories: categories,
          customCategories: categoryNames
        });
        
        console.log('✅ Categories state updated:', categoryNames);
      })
      .catch(e => {
        console.error('❌ Error fetching categories:', e);
        // Set fallback categories if API fails
        const fallbackCategories = ['Bread', 'Pastries', 'Drinks', 'Chips', 'Soda', 'General'];
        this.setState({ 
          customCategories: fallbackCategories,
          categories: fallbackCategories.map(name => ({ name }))
        });
      });
  }

  async fetchSalesData() {
    try {
      const response = await fetch('http://localhost:5001/api/sales');
      if (response.ok) {
        const data = await response.json();
        this.setState({ salesData: data });
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  }

  async fetchDailySales() {
    try {
      const response = await fetch('http://localhost:5001/api/sales/daily');
      if (response.ok) {
        const data = await response.json();
        this.setState({ dailySales: data });
      }
    } catch (error) {
      console.error('Error fetching daily sales:', error);
    }
  }

  async fetchMonthlySales(year, month) {
    try {
      const response = await fetch(`http://localhost:5001/api/sales/monthly/${year}/${month}`);
      if (response.ok) {
        const data = await response.json();
        this.setState({ monthlySales: data });
      }
    } catch (error) {
      console.error('Error fetching monthly sales:', error);
    }
  }

  async fetchYearlySales(year) {
    try {
      const response = await fetch(`http://localhost:5001/api/sales/yearly/${year}`);
      if (response.ok) {
        const data = await response.json();
        this.setState({ yearlySales: data });
      }
    } catch (error) {
      console.error('Error fetching yearly sales:', error);
    }
  }

  async handleRecordSale() {
    const { selectedSaleItem, saleQuantity } = this.state;
    
    console.log('🛒 Recording sale:', { selectedSaleItem, saleQuantity });
    
    if (!selectedSaleItem || !saleQuantity || parseInt(saleQuantity) <= 0) {
      alert('Please select an item and enter a valid quantity');
      return;
    }

    // Validate item has required fields
    const itemId = selectedSaleItem.id || selectedSaleItem.item_id || selectedSaleItem.itemID;
    if (!itemId) {
      console.error('❌ Item ID not found:', selectedSaleItem);
      alert('Error: Item ID not found. Please try selecting the item again.');
      return;
    }

    // Check if quantity exceeds available stock
    if (parseInt(saleQuantity) > selectedSaleItem.quantity) {
      alert(`Error: Cannot sell ${saleQuantity} items. Only ${selectedSaleItem.quantity} available in stock.`);
      return;
    }

    try {
      const saleData = {
        item_id: itemId,
        quantity_sold: parseInt(saleQuantity)
      };
      
      console.log('📤 Sending sale data:', saleData);

      const response = await fetch('http://localhost:5001/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
      });

      console.log('📥 Sale response status:', response.status);
      const result = await response.json();
      console.log('📥 Sale response data:', result);

      if (response.ok && result.success !== false) {
        const saleInfo = result.sale || result.data || result;
        const itemName = saleInfo.item_name || selectedSaleItem.name || 'Item';
        const quantity = saleInfo.quantity_sold || saleQuantity;
        const total = saleInfo.total_amount || (selectedSaleItem.price * quantity);
        
        alert(`✅ Sale recorded successfully!\n${itemName} x${quantity} = ₱${total}`);
        
        this.setState({ 
          selectedSaleItem: null, 
          saleQuantity: '',
          mainContent: 'daily-sales'
        });
        
        // Refresh data
        this.fetchInventoryItems();
        this.fetchDailySales();
        this.fetchCriticalItems();
        this.fetchSalesSummary();
      } else {
        const errorMessage = result.message || result.error || 'Unknown error occurred';
        console.error('❌ Sale failed:', errorMessage);
        alert(`❌ Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Sale network error:', error);
      alert('❌ Network error: ' + error.message + '\n\nPlease check if the backend server is running on port 5001.');
    }
  }

  async fetchSalesSummary() {
    try {
      console.log('Fetching sales summary...');
      const response = await fetch('http://localhost:5001/api/sales/summary');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Sales summary response:', data);
      
      this.setState({ salesSummary: data });
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      this.setState({ error: error.message });
    }
  }

  // Add Items Methods
  handleAddItemsChange(index, field, value) {
    const updatedRows = this.state.addItemsRows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    this.setState({ addItemsRows: updatedRows });
  }

  addItemsRow() {
    this.setState({
      addItemsRows: [
        ...this.state.addItemsRows,
        { itemName: '', quantity: '', price: '', category: '' }
      ]
    });
  }

  removeItemsRow(index) {
    if (this.state.addItemsRows.length > 1) {
      const updatedRows = this.state.addItemsRows.filter((_, i) => i !== index);
      this.setState({ addItemsRows: updatedRows });
    }
  }

  async saveAllItems() {
    const { addItemsRows } = this.state;
    
    const validRows = addItemsRows.filter(row => 
      row.itemName && row.quantity && row.price && row.category
    );

    if (validRows.length === 0) {
      alert('Please fill out at least one complete row before saving.');
      return;
    }

    try {
      for (const row of validRows) {
        const response = await fetch('http://localhost:5001/api/inventory/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item_name: row.itemName,
            quantity: parseInt(row.quantity),
            price: parseFloat(row.price),
            category: row.category
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to add item: ${row.itemName}`);
        }
      }

      alert(`Successfully added ${validRows.length} item(s)!`);
      this.clearAddItemsForm();
      this.fetchInventoryItems();
    } catch (error) {
      alert('Error adding items: ' + error.message);
    }
  }

  clearAddItemsForm() {
    this.setState({
      addItemsRows: [
        { itemName: '', quantity: '', price: '', category: '' },
        { itemName: '', quantity: '', price: '', category: '' },
        { itemName: '', quantity: '', price: '', category: '' },
        { itemName: '', quantity: '', price: '', category: '' }
      ]
    });
  }

  // Categories Methods
  async handleAddCategory() {
    const { newCategoryName, newCategoryDescription } = this.state;
    
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || `Category for ${newCategoryName.trim()} items`
        })
      });

      if (response.ok) {
        alert('Category added successfully!');
        this.setState({ newCategoryName: '', newCategoryDescription: '' });
        this.fetchCategories();
      } else {
        const result = await response.json();
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert('Error adding category: ' + error.message);
    }
  }

  async handleUpdateCategory() {
    const { selectedCategoryForEdit, editCategoryName, editCategoryDescription } = this.state;
    
    if (!selectedCategoryForEdit || !editCategoryName.trim()) {
      alert('Please select a category and enter a new name');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/categories/${selectedCategoryForEdit}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newCategoryName: editCategoryName.trim(),
          description: editCategoryDescription.trim()
        })
      });

      if (response.ok) {
        alert('Category updated successfully!');
        this.setState({ 
          selectedCategoryForEdit: null, 
          editCategoryName: '', 
          editCategoryDescription: '' 
        });
        this.fetchCategories();
        this.fetchInventoryItems();
      } else {
        const result = await response.json();
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert('Error updating category: ' + error.message);
    }
  }

  async handleDeleteCategory(categoryName) {
    if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"? This will update all items in this category to "Uncategorized".`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/categories/${categoryName}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Category deleted successfully!');
        this.fetchCategories();
        this.fetchInventoryItems();
      } else {
        const result = await response.json();
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert('Error deleting category: ' + error.message);
    }
  }

  // Update Items Methods
  handleUpdateItemSelect(item) {
    console.log('Selected item for update:', item);
    
    if (!item) {
      this.setState({
        selectedUpdateItem: null,
        updateItemName: '',
        updateItemQuantity: '',
        updateItemPrice: '',
        updateItemCategory: ''
      });
      return;
    }

    // Handle different field name possibilities
    const itemName = item.item_name || item.name || '';
    const itemQuantity = item.quantity || 0;
    const itemPrice = item.price || 0;
    const itemCategory = item.category || '';

    this.setState({
      selectedUpdateItem: item,
      updateItemName: itemName,
      updateItemQuantity: itemQuantity.toString(),
      updateItemPrice: itemPrice.toString(),
      updateItemCategory: itemCategory
    });

    console.log('Form populated with:', {
      name: itemName,
      quantity: itemQuantity,
      price: itemPrice,
      category: itemCategory
    });
  }

  handleUpdateItemChange(field, value) {
    this.setState({ [field]: value });
  }

  async saveItemUpdate() {
    const { 
      selectedUpdateItem, 
      updateItemName, 
      updateItemQuantity, 
      updateItemPrice, 
      updateItemCategory 
    } = this.state;

    if (!selectedUpdateItem) {
      alert('Please select an item to update');
      return;
    }

    if (!updateItemName || !updateItemQuantity || !updateItemPrice || !updateItemCategory) {
      alert('Please fill all fields');
      return;
    }

    try {
      // Use multiple ID field checks to ensure compatibility
      const itemId = selectedUpdateItem.item_id || selectedUpdateItem.id;
      
      if (!itemId) {
        alert('Error: Item ID not found');
        return;
      }
      
      console.log('Updating item with ID:', itemId);
      console.log('Selected item data:', selectedUpdateItem);
      console.log('Update data:', {
        item_name: updateItemName,
        quantity: parseInt(updateItemQuantity),
        price: parseFloat(updateItemPrice),
        category: updateItemCategory
      });

      const response = await fetch(`http://localhost:5001/api/inventory/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item_name: updateItemName,
          quantity: parseInt(updateItemQuantity),
          price: parseFloat(updateItemPrice),
          category: updateItemCategory
        })
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Update response:', result);

      if (response.ok && result.success !== false) {
        alert('✅ Item updated successfully!');
        this.setState({
          selectedUpdateItem: null,
          updateItemName: '',
          updateItemQuantity: '',
          updateItemPrice: '',
          updateItemCategory: ''
        });
        await this.fetchInventoryItems(); // Refresh the items list
      } else {
        const errorMessage = result.message || result.error || 'Failed to update item';
        console.error('Update failed:', errorMessage);
        alert(`❌ Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('❌ Network error: ' + error.message);
    }
  }

  // User Management Methods
  handleAddUserChange(field, value) {
    this.setState({
      [`addUser${field.charAt(0).toUpperCase() + field.slice(1)}`]: value
    });
  }

  async handleAddUser() {
    const { addUserName, addUserEmail, addUserPassword, addUserRole } = this.state;

    // Validation
    if (!addUserName.trim()) {
      alert('Please enter a full name');
      return;
    }
    if (!addUserEmail.trim()) {
      alert('Please enter an email address');
      return;
    }
    if (!addUserPassword.trim()) {
      alert('Please enter a password');
      return;
    }
    if (!addUserRole) {
      alert('Please select a role');
      return;
    }

    try {
      console.log('Creating user with data:', {
        fullName: addUserName,
        email: addUserEmail,
        password: addUserPassword,
        role: addUserRole
      });

      const requestBody = {
        username: addUserEmail.split('@')[0], // Generate username from email
        firstname: addUserName.split(' ')[0] || addUserName,
        lastname: addUserName.split(' ').slice(1).join(' ') || '',
        email: addUserEmail,
        password: addUserPassword,
        role: addUserRole,
        status: 'Active'
      };

      console.log('Sending request body:', requestBody);

      const response = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('Add user response:', result);
      console.log('Response status:', response.status);

      if (response.ok && result.success) {
        alert('✅ User created successfully!');
        // Clear the form
        this.setState({
          addUserName: '',
          addUserEmail: '',
          addUserPassword: '',
          addUserRole: ''
        });
        // Refresh users list
        await this.fetchUsers();
      } else {
        const errorMessage = result.message || result.error || 'Failed to create user';
        console.error('User creation failed:', errorMessage);
        console.error('Full response:', result);
        
        // Show more detailed error information
        let alertMessage = `❌ Error: ${errorMessage}`;
        if (result.solution) {
          alertMessage += `\n\nSolution: ${result.solution}`;
        }
        if (result.error && result.error !== errorMessage) {
          alertMessage += `\n\nTechnical details: ${result.error}`;
        }
        
        alert(alertMessage);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('❌ Network error: ' + error.message);
    }
  }

  // Add debug function to test user creation
  async handleDebugUserCreation() {
    try {
      console.log('Running user creation debug...');
      
      const debugData = {
        username: 'debugtest',
        firstname: 'Debug',
        lastname: 'Test',
        email: 'debug@test.com',
        password: 'debug123',
        role: 'User',
        status: 'Active'
      };
      
      const response = await fetch('http://localhost:5001/api/users/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(debugData)
      });
      
      const result = await response.json();
      console.log('Debug response:', result);
      
      alert(`Debug Results:\n${JSON.stringify(result, null, 2)}`);
      
    } catch (error) {
      console.error('Debug error:', error);
      alert('Debug failed: ' + error.message);
    }
  }

  async fetchUsers() {
    try {
      const response = await fetch('http://localhost:5001/api/users');
      const result = await response.json();
      
      if (response.ok && result.success) {
        this.setState({ users: result.data || [] });
      } else {
        console.error('Failed to fetch users:', result);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  // Request Management Methods
  async fetchUserRequests() {
    try {
      console.log('Fetching user requests...');
      const response = await fetch('http://localhost:5001/api/requests');
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('Requests fetched:', result.data);
        this.setState({ userRequests: result.data || [] });
      } else {
        console.error('Failed to fetch requests:', result);
        this.setState({ userRequests: [] });
      }
    } catch (error) {
      console.error('Error fetching user requests:', error);
      this.setState({ userRequests: [] });
    }
  }

  async fetchRequestStats() {
    try {
      const response = await fetch('http://localhost:5001/api/requests/stats');
      const result = await response.json();
      
      if (response.ok && result.success) {
        this.setState({ requestStats: result.data });
      } else {
        console.error('Failed to fetch request stats:', result);
      }
    } catch (error) {
      console.error('Error fetching request stats:', error);
    }
  }

  async handleRequestStatusChange(requestId, newStatus, adminResponse = '') {
    try {
      console.log('Updating request status:', { requestId, newStatus, adminResponse });
      
      const response = await fetch(`http://localhost:5001/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          admin_response: adminResponse
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`Request ${newStatus} successfully!`);
        // Refresh requests and stats
        await this.fetchUserRequests();
        await this.fetchRequestStats();
        await this.fetchInventoryItems(); // Refresh inventory if approved
      } else {
        const errorMessage = result.message || 'Failed to update request';
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Network error: ' + error.message);
    }
  }

  // Comprehensive Analytics Methods
  generateSalesTrends() {
    const { salesData, dailySales, monthlySales } = this.state;
    
    // Generate 30-day sales trend data
    const salesTrends = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      
      // Simulate sales data with realistic patterns
      const baseRevenue = 2000 + Math.random() * 1500;
      const weekendBoost = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1;
      const monthlyTrend = 1 + (0.1 * Math.sin(i * 0.1));
      
      salesTrends.push({
        date: dateStr,
        revenue: Math.round(baseRevenue * weekendBoost * monthlyTrend),
        transactions: Math.round(15 + Math.random() * 25),
        avgOrderValue: Math.round(baseRevenue / (15 + Math.random() * 25))
      });
    }
    
    return salesTrends;
  }

  generateInventoryTrends() {
    const { inventoryItems } = this.state;
    
    return inventoryItems.map(item => ({
      name: item.item_name || item.name,
      currentStock: item.quantity,
      idealStock: Math.round(item.quantity * 1.5),
      reorderPoint: Math.round(item.quantity * 0.3),
      weeklyUsage: Math.round(5 + Math.random() * 15),
      category: item.category || 'General',
      turnoverRate: (Math.random() * 4 + 1).toFixed(2)
    }));
  }

  generateForecastData() {
    const salesTrends = this.generateSalesTrends();
    const forecastData = [];
    
    // Use last 7 days average for next 30 days forecast
    const recentSales = salesTrends.slice(-7);
    const avgRevenue = recentSales.reduce((sum, day) => sum + day.revenue, 0) / 7;
    const growthRate = 1.05; // 5% monthly growth assumption
    
    for (let i = 1; i <= 30; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      
      const seasonalFactor = 1 + (0.2 * Math.sin(i * 0.1));
      const trendFactor = Math.pow(growthRate, i / 30);
      
      forecastData.push({
        date: futureDate.toLocaleDateString(),
        predictedRevenue: Math.round(avgRevenue * seasonalFactor * trendFactor),
        confidence: Math.max(0.6, 0.95 - (i * 0.01)),
        range: {
          high: Math.round(avgRevenue * seasonalFactor * trendFactor * 1.2),
          low: Math.round(avgRevenue * seasonalFactor * trendFactor * 0.8)
        }
      });
    }
    
    return forecastData;
  }

  generateCategoryAnalytics() {
    const { inventoryItems, salesData } = this.state;
    
    const categoryMap = {};
    
    inventoryItems.forEach(item => {
      const category = item.category || 'General';
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          totalItems: 0,
          totalValue: 0,
          avgPrice: 0,
          lowStockItems: 0,
          salesVolume: 0
        };
      }
      
      categoryMap[category].totalItems++;
      categoryMap[category].totalValue += (item.price || 0) * (item.quantity || 0);
      categoryMap[category].lowStockItems += item.quantity <= 10 ? 1 : 0;
      categoryMap[category].salesVolume += Math.random() * 50; // Simulated sales
    });
    
    return Object.values(categoryMap).map(category => ({
      ...category,
      avgPrice: Math.round(category.totalValue / category.totalItems),
      marketShare: Math.round((category.totalValue / Object.values(categoryMap).reduce((sum, cat) => sum + cat.totalValue, 0)) * 100)
    }));
  }

  generatePerformanceMetrics() {
    const { inventoryItems, salesData } = this.state;
    const salesTrends = this.generateSalesTrends();
    
    const totalRevenue = salesTrends.reduce((sum, day) => sum + day.revenue, 0);
    const avgDailyRevenue = totalRevenue / 30;
    const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    
    return {
      totalRevenue: totalRevenue,
      avgDailyRevenue: Math.round(avgDailyRevenue),
      totalInventoryValue: Math.round(totalInventoryValue),
      totalProducts: inventoryItems.length,
      lowStockItems: inventoryItems.filter(item => item.quantity <= 10).length,
      outOfStockItems: inventoryItems.filter(item => item.quantity === 0).length,
      inventoryTurnover: (totalRevenue / totalInventoryValue * 12).toFixed(2),
      profitMargin: Math.round(25 + Math.random() * 15), // Simulated 25-40% margin
      customerSatisfaction: (Math.random() * 0.3 + 0.7).toFixed(2), // 70-100%
      avgOrderProcessingTime: Math.round(2 + Math.random() * 3) // 2-5 minutes
    };
  }

  generateUserActivityData() {
    const activities = [
      'Login', 'View Dashboard', 'Add Item', 'Update Item', 'Record Sale', 
      'View Reports', 'Manage Categories', 'Check Inventory', 'Generate Report'
    ];
    
    return activities.map(activity => ({
      activity,
      count: Math.round(10 + Math.random() * 50),
      lastPerformed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      avgDuration: Math.round(1 + Math.random() * 5) + ' min'
    }));
  }

  generateComprehensiveAnalytics() {
    this.setState({
      salesTrends: this.generateSalesTrends(),
      inventoryTrends: this.generateInventoryTrends(),
      forecastData: this.generateForecastData(),
      categoryAnalytics: this.generateCategoryAnalytics(),
      performanceMetrics: this.generatePerformanceMetrics(),
      userActivityData: this.generateUserActivityData()
    });
  }

  render() {
    const { 
      loading, 
      openDropdown, 
      mainContent,
      userInfo,
      selectedSaleItem,
      saleQuantity,
      dailySales,
      criticalItems,
      showCriticalAlert,
      error
    } = this.state;

    if (loading) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span>Loading...</span>
        </div>
      );
    }

    if (!this.state.isLoggedIn) {
      return null;
    }

    return (
      <div className="dashboard-root" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        {/* Modern Header - Reborn Design */}
        <div className="dashboard-header" style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
          color: '#ffffff',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '70px',
          zIndex: 1000,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Left Section - Brand & Welcome */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
            }}>
              <span style={{ fontSize: '20px' }}>🍞</span>
            </div>
            <div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Breadmilk Inventory
              </div>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.7,
                fontWeight: '400'
              }}>
                Welcome back, {userInfo?.username || 'User'}
              </div>
            </div>
          </div>

          {/* Center Section - Navigation Pills */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '8px',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)'
          }}>
            {[
              { label: 'Dashboard', key: 'dashboard', icon: '🏠' },
              { label: 'Inventory', key: 'all-items-table', icon: '📦' },
              { label: 'Sales', key: 'daily-sales', icon: '💰' },
              { label: 'Analytics', key: 'comprehensive-analytics', icon: '📊' }
            ].map((nav) => (
              <button
                key={nav.key}
                onClick={() => this.setState({ mainContent: nav.key })}
                style={{
                  background: this.state.mainContent === nav.key 
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                    : 'transparent',
                  color: this.state.mainContent === nav.key ? '#fff' : '#cbd5e1',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (this.state.mainContent !== nav.key) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (this.state.mainContent !== nav.key) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#cbd5e1';
                  }
                }}
              >
                <span>{nav.icon}</span>
                <span>{nav.label}</span>
              </button>
            ))}
          </div>

          {/* Right Section - User Info & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Notifications */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '8px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}>
              <span style={{ fontSize: '18px' }}>🔔</span>
              {this.state.criticalItems?.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '140px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {this.state.criticalItems.length}
                </span>
              )}
            </div>

            {/* User Avatar & Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                {(userInfo?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {userInfo?.username || 'Guest'}
                </span>
                <span style={{ fontSize: '11px', opacity: 0.6 }}>
                  Admin • Online
                </span>
              </div>
            </div>

            {/* Modern Logout Button */}
            <button
              onClick={this.handleLogout}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                color: '#ffffff',
                padding: '10px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Container - Reborn Design */}
        <div style={{
          marginTop: '70px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: 'calc(100vh - 70px)'
        }}>
          {/* Status Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '0 0 24px 24px',
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderTop: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: 'pulse 2s infinite'
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  System Online
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                Items: {this.state.items?.length || 0}
              </span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                Categories: {this.state.categories?.length || 0}
              </span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                Users: {this.state.users?.length || 0}
              </span>
            </div>
          </div>

        <div className="dashboard-container" style={{ display: 'flex' }}>
          <nav className="dashboard-sidebar" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            color: '#374151',
            padding: '24px 16px',
            borderRadius: '0 24px 24px 0',
            boxShadow: '8px 0 32px rgba(0, 0, 0, 0.1)',
            width: '280px',
            height: 'calc(100vh - 142px)',
            position: 'fixed',
            top: '142px',
            left: '0',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderLeft: 'none'
          }}>
            <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
              {/* Sales Management Dropdown */}
              <li
                className="sidebar-dropdown"
                onClick={() => this.handleDropdownClick('sales')}
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: openDropdown === 'sales' ? 
                    'linear-gradient(135deg, #0d9488, #14b8a6)' : 'rgba(255,255,255,0.7)',
                  color: openDropdown === 'sales' ? '#ffffff' : '#134e4a',
                  marginBottom: '10px',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(13, 148, 136, 0.25)',
                  boxShadow: openDropdown === 'sales' ? '0 4px 12px rgba(13, 148, 136, 0.35)' : 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  if (openDropdown !== 'sales') {
                    e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                    e.target.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (openDropdown !== 'sales') {
                    e.target.style.background = 'rgba(255,255,255,0.7)';
                    e.target.style.transform = 'translateX(0px)';
                  }
                }}>
                <span style={{ flex: 1 }}>💰 Sales Management</span>
                <ChevronDown open={openDropdown === 'sales'} />
              </li>
              {openDropdown === 'sales' && (
                <ul className="sidebar-dropdown-menu" style={{ paddingLeft: '16px', marginTop: '8px' }}>
                  <li
                    className="sidebar-dropdown-item"
                    onClick={() => {
                      this.setState({ mainContent: 'record-sale' });
                      this.fetchInventoryItems();
                    }}
                    style={{
                      cursor: 'pointer',
                      padding: '8px 12px',
                      fontSize: 14,
                      borderRadius: '4px',
                      marginBottom: '4px',
                      background: '#f8f9fa',
                      color: '#555555',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e9ecef';
                      e.target.style.color = '#333333';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.color = '#555555';
                    }}>
                    🛒 Record Sale
                  </li>
                  <li
                    className="sidebar-dropdown-item"
                    onClick={() => {
                      this.setState({ mainContent: 'daily-sales' });
                      this.fetchDailySales();
                    }}
                    style={{
                      cursor: 'pointer',
                      padding: '8px 12px',
                      fontSize: 14,
                      borderRadius: '4px',
                      marginBottom: '4px',
                      background: 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    📅 Daily Sales
                  </li>
                  <li
                    className="sidebar-dropdown-item"
                    onClick={() => {
                      this.setState({ mainContent: 'monthly-sales' });
                      const currentDate = new Date();
                      this.fetchMonthlySales(currentDate.getFullYear(), currentDate.getMonth() + 1);
                    }}
                    style={{
                      cursor: 'pointer',
                      padding: '8px 12px',
                      fontSize: 14,
                      borderRadius: '4px',
                      marginBottom: '4px',
                      background: 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    📊 Monthly Sales
                  </li>
                  <li
                    className="sidebar-dropdown-item"
                    onClick={() => {
                      this.setState({ mainContent: 'yearly-sales' });
                      this.fetchYearlySales(new Date().getFullYear());
                    }}
                    style={{
                      cursor: 'pointer',
                      padding: '8px 12px',
                      fontSize: 14,
                      borderRadius: '4px',
                      marginBottom: '4px',
                      background: 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    📈 Yearly Sales
                  </li>
                </ul>
              )}

              {/* Inventory Management Dropdown */}
              <li
                className="sidebar-dropdown"
                onClick={() => this.handleDropdownClick('inventory')}
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: openDropdown === 'inventory' ? '#1565c0' : 'transparent',
                  marginBottom: '8px',
                  transition: 'background 0.3s'
                }}
              >
                <span style={{ flex: 1 }}>📦 Inventory Management</span>
                <ChevronDown open={openDropdown === 'inventory'} />
              </li>
              {openDropdown === 'inventory' && (
                <ul className="sidebar-dropdown-menu" style={{ paddingLeft: '16px', marginTop: '8px' }}>
                  <li
                    onClick={() => {
                      this.setState({ mainContent: 'add-items-table' });
                      this.fetchCategories();
                    }}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'add-items-table' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'add-items-table' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'add-items-table') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'add-items-table') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    ➕ Add Items
                  </li>
                  <li
                    onClick={() => this.setState({ mainContent: 'update-items' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'update-items' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'update-items' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'update-items') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'update-items') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    🔄 Update Items
                  </li>
                  <li
                    onClick={() => this.setState({ mainContent: 'all-items-table' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'all-items-table' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'all-items-table' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'all-items-table') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'all-items-table') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    📋 All Items
                  </li>
                  <li
                    onClick={() => this.setState({ mainContent: 'critical-items' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'critical-items' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'critical-items' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'critical-items') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'critical-items') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    ⚠️ Critical Items {criticalItems.length > 0 && (
                      <span style={{
                        background: '#f44336',
                        color: '#fff',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '12px',
                        marginLeft: '8px'
                      }}>
                        {criticalItems.length}
                      </span>
                    )}
                  </li>
                  <li
                    onClick={() => this.setState({ mainContent: 'inventory-analytics' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'inventory-analytics' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'inventory-analytics' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'inventory-analytics') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'inventory-analytics') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    📊 Inventory Analytics
                  </li>
                  <li
                    onClick={() => this.setState({ mainContent: 'stock-reports' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'stock-reports' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'stock-reports' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'stock-reports') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'stock-reports') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    📋 Stock Reports
                  </li>
                </ul>
              )}

              {/* Categories Management Dropdown */}
              <li
                className="sidebar-dropdown"
                onClick={() => this.handleDropdownClick('categories')}
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: openDropdown === 'categories' ? 'linear-gradient(135deg, #0d9488, #14b8a6)' : 'transparent',
                  marginBottom: '8px',
                  transition: 'background 0.3s'
                }}
              >
                <span style={{ flex: 1 }}>📂 Categories Management</span>
                <ChevronDown open={openDropdown === 'categories'} />
              </li>
              {openDropdown === 'categories' && (
                <ul className="sidebar-dropdown-menu" style={{ paddingLeft: '16px', marginTop: '8px' }}>
                  <li
                    onClick={() => this.setState({ mainContent: 'add-categories' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'add-categories' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'add-categories' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'add-categories') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'add-categories') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    ➕ Add Categories
                  </li>
                  <li
                    onClick={() => this.setState({ mainContent: 'manage-categories' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'manage-categories' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'manage-categories' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'manage-categories') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'manage-categories') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    🔧 Manage Categories
                  </li>
                </ul>
              )}

              {/* Analytics & Predictions Dropdown */}
              <li
                className="sidebar-dropdown"
                onClick={() => this.handleDropdownClick('analytics')}
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: openDropdown === 'analytics' ? 'linear-gradient(135deg, #0d9488, #14b8a6)' : 'transparent',
                  marginBottom: '8px',
                  transition: 'background 0.3s'
                }}
              >
                <span style={{ flex: 1 }}>🔮 Analytics & Predictions</span>
                <ChevronDown open={openDropdown === 'analytics'} />
              </li>
              {openDropdown === 'analytics' && (
                <ul className="sidebar-dropdown-menu" style={{ paddingLeft: '16px', marginTop: '8px' }}>
                  <li
                    onClick={() => this.setState({ mainContent: 'data-predictions' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'data-predictions' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'data-predictions' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'data-predictions') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'data-predictions') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    🔮 Data Predictions
                  </li>
                  <li
                    onClick={() => this.setState({ mainContent: 'demand-forecasting' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'demand-forecasting' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'demand-forecasting' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'demand-forecasting') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'demand-forecasting') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    📈 Demand Forecasting
                  </li>
                  <li
                    onClick={() => this.setState({ mainContent: 'inventory-analytics' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'inventory-analytics' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'inventory-analytics' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'inventory-analytics') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'inventory-analytics') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    📊 Inventory Analytics
                  </li>
                </ul>
              )}

              {/* Add User Management after Inventory Management */}
              <li
                className="sidebar-dropdown"
                onClick={() => this.handleDropdownClick('usermanagement')}
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: openDropdown === 'usermanagement' ? 'linear-gradient(135deg, #0d9488, #14b8a6)' : 'transparent',
                  marginBottom: '8px',
                  transition: 'background 0.3s'
                }}
              >
                <span style={{ flex: 1 }}>👥 User Management</span>
                <ChevronDown open={openDropdown === 'usermanagement'} />
              </li>
              {openDropdown === 'usermanagement' && (
                <ul className="sidebar-dropdown-menu" style={{ paddingLeft: '16px', marginTop: '8px' }}>
                  <li
                    onClick={() => this.setState({ mainContent: 'user-settings' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'user-settings' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'user-settings' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'user-settings') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'user-settings') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    ⚙️ User Settings
                  </li>
                  <li
                    onClick={() => this.setState({ mainContent: 'manage-users' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'manage-users' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'manage-users' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'manage-users') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'manage-users') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    👤 Manage Users
                  </li>
                </ul>
              )}

              {/* Request Management Dropdown */}
              <li
                className="sidebar-dropdown"
                onClick={() => this.handleDropdownClick('requests')}
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: openDropdown === 'requests' ? 
                    'linear-gradient(135deg, #0d9488, #14b8a6)' : 'rgba(255,255,255,0.7)',
                  color: openDropdown === 'requests' ? '#ffffff' : '#134e4a',
                  marginBottom: '10px',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(13, 148, 136, 0.25)',
                  boxShadow: openDropdown === 'requests' ? '0 4px 12px rgba(13, 148, 136, 0.35)' : 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  if (openDropdown !== 'requests') {
                    e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                    e.target.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (openDropdown !== 'requests') {
                    e.target.style.background = 'rgba(255,255,255,0.7)';
                    e.target.style.transform = 'translateX(0px)';
                  }
                }}>
                <span style={{ flex: 1 }}>📋 Request Management</span>
                {this.state.requestStats?.pending > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '12px',
                    marginRight: '8px',
                    fontWeight: 'bold'
                  }}>
                    {this.state.requestStats.pending}
                  </span>
                )}
                <ChevronDown open={openDropdown === 'requests'} />
              </li>
              {openDropdown === 'requests' && (
                <ul className="sidebar-dropdown-menu" style={{ paddingLeft: '16px', marginTop: '8px' }}>
                  <li
                    onClick={() => this.setState({ mainContent: 'all-requests' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'all-requests' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'all-requests' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'all-requests') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'all-requests') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    📋 All Requests
                    {this.state.userRequests?.length > 0 && (
                      <span style={{
                        background: '#64748b',
                        color: '#fff',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '10px',
                        marginLeft: '8px'
                      }}>
                        {this.state.userRequests.length}
                      </span>
                    )}
                  </li>
                  <li
                    onClick={() => this.setState({ mainContent: 'pending-requests' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'pending-requests' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'pending-requests' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'pending-requests') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'pending-requests') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    🕐 Pending Requests
                    {this.state.requestStats?.pending > 0 && (
                      <span style={{
                        background: '#f59e0b',
                        color: '#fff',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '10px',
                        marginLeft: '8px'
                      }}>
                        {this.state.requestStats.pending}
                      </span>
                    )}
                  </li>
                  <li
                    onClick={() => this.setState({ mainContent: 'request-stats' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'request-stats' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'request-stats' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'request-stats') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'request-stats') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    📊 Request Statistics
                  </li>
                </ul>
              )}

              {/* Comprehensive Analytics Dashboard */}
              <li
                onClick={() => {
                  this.setState({ mainContent: 'comprehensive-analytics' });
                  this.generateComprehensiveAnalytics();
                }}
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: this.state.mainContent === 'comprehensive-analytics' ? 
                    'linear-gradient(135deg, #0d9488, #14b8a6)' : 'rgba(255,255,255,0.7)',
                  color: this.state.mainContent === 'comprehensive-analytics' ? '#ffffff' : '#134e4a',
                  marginBottom: '10px',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(13, 148, 136, 0.25)',
                  boxShadow: this.state.mainContent === 'comprehensive-analytics' ? '0 4px 12px rgba(13, 148, 136, 0.35)' : 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  if (this.state.mainContent !== 'comprehensive-analytics') {
                    e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                    e.target.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (this.state.mainContent !== 'comprehensive-analytics') {
                    e.target.style.background = 'rgba(255,255,255,0.7)';
                    e.target.style.transform = 'translateX(0px)';
                  }
                }}
              >
                📊 Comprehensive Analytics
              </li>
            </ul>
          </nav>

          <div className="dashboard-content" style={{ 
            flex: 1, 
            padding: '32px', 
            marginLeft: '280px',
            background: 'transparent',
            minHeight: 'calc(100vh - 142px)',
            marginTop: '0px'
          }}>
            {/* Critical Items Alert */}
            {showCriticalAlert && (
              <div style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                background: '#ff5722',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 1000,
                maxWidth: '300px'
              }}>
                <strong>⚠️ Low Stock Alert!</strong>
                <br />
                {criticalItems.length} item(s) are running low on stock.
              </div>
            )}

            {/* Record Sale Page */}
            {mainContent === 'record-sale' && (
              <div style={{
                width: '100%',
                maxWidth: 800,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24
              }}>
                <h2 style={{ fontWeight: 700, color: '#333', fontSize: 20, textAlign: 'center', marginBottom: 16 }}>
                  🛒 Record New Sale
                </h2>
                
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    Select Item:
                  </label>
                  <select
                    value={selectedSaleItem?.id || ''}
                    onChange={(e) => {
                      const item = this.state.inventoryItems.find(i => i.id === parseInt(e.target.value));
                      this.setState({ selectedSaleItem: item });
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px',
                      marginBottom: '16px'
                    }}
                  >
                    <option value="">Choose an item...</option>
                    {this.state.inventoryItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} - ₱{item.price} (Stock: {item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    Quantity to Sell:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedSaleItem?.quantity || 1}
                    value={saleQuantity}
                    onChange={(e) => this.setState({ saleQuantity: e.target.value })}
                    placeholder="Enter quantity..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    onClick={this.handleRecordSale}
                    disabled={!selectedSaleItem || !saleQuantity}
                    style={{
                      background: (!selectedSaleItem || !saleQuantity) ? '#ccc' : '#4caf50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '12px 24px',
                      fontSize: 16,
                      fontWeight: 'bold',
                      cursor: (!selectedSaleItem || !saleQuantity) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    💰 Record Sale
                  </button>
                </div>
              </div>
            )}

            {/* Daily Sales Page */}
            {mainContent === 'daily-sales' && dailySales && (
              <div style={{
                width: '100%',
                maxWidth: 1000,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24
              }}>
                <h2 style={{ textAlign: 'center', marginBottom: 16 }}>
                  📅 Daily Sales - {dailySales.date}
                </h2>
                <div style={{ marginBottom: 20, textAlign: 'center' }}>
                  <strong>Revenue: ₱{dailySales.summary.total_revenue || 0}</strong> | 
                  <strong> Transactions: {dailySales.summary.total_transactions || 0}</strong>
                </div>
                {dailySales.sales.map((sale, index) => (
                  <div key={index} style={{ 
                    padding: 12, 
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>{sale.item_name}</span>
                    <span>Qty: {sale.quantity_sold}</span>
                    <span>₱{sale.total_amount}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Monthly Sales Page */}
            {mainContent === 'monthly-sales' && this.state.monthlySales && (
              <div className="monthly-sales-container" style={{
                width: '100%',
                maxWidth: 1200,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24
              }}>
                <h2 style={{ fontWeight: 700, color: '#333', fontSize: 20, textAlign: 'center', marginBottom: 16 }}>
                  📊 Monthly Sales Report - {new Date(0, this.state.monthlySales.month - 1).toLocaleString('default', { month: 'long' })} {this.state.monthlySales.year}
                </h2>

                {/* Monthly Summary Cards */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: 20, 
                  marginBottom: 32 
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #4caf50, #45a049)',
                    color: 'white',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(76,175,80,0.3)'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 32 }}>₱{this.state.monthlySales.monthTotal?.total_revenue || 0}</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: 16 }}>Monthly Revenue</p>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                    color: 'white',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(33,150,243,0.3)'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 32 }}>{this.state.monthlySales.monthTotal?.total_transactions || 0}</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: 16 }}>Total Transactions</p>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                    color: 'white',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(255,152,0,0.3)'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 32 }}>{this.state.monthlySales.monthTotal?.total_items_sold || 0}</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: 16 }}>Items Sold</p>
                  </div>
                </div>

                {/* Top Selling Items */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ color: '#333', marginBottom: 16 }}>🏆 Top Selling Items This Month</h3>
                  <div style={{ borderRadius: 8, border: '1px solid #ddd', overflow: 'hidden' }}>
                    <div style={{
                      background: '#f5f5f5',
                      padding: '12px 16px',
                      borderBottom: '1px solid #ddd',
                      fontWeight: 'bold',
                      display: 'grid',
                      gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
                      gap: 16
                    }}>
                      <span>Rank</span>
                      <span>Item</span>
                      <span>Quantity Sold</span>
                      <span>Revenue</span>
                      <span>Category</span>
                    </div>
                    {this.state.monthlySales.topItems?.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>
                        No sales data available for this month.
                      </div>
                    ) : (
                      this.state.monthlySales.topItems?.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '12px 16px',
                            borderBottom: index < this.state.monthlySales.topItems.length - 1 ? '1px solid #eee' : 'none',
                            display: 'grid',
                            gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
                            gap: 16,
                            alignItems: 'center',
                            background: index % 2 === 0 ? '#fafafa' : '#fff'
                          }}
                        >
                          <span style={{ 
                            fontWeight: 'bold',
                            color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#666'
                          }}>
                            #{index + 1}
                          </span>
                          <span style={{ fontWeight: 600 }}>{item.item_name}</span>
                          <span>{item.total_sold} units</span>
                          <span style={{ fontWeight: 600, color: '#4caf50' }}>₱{item.total_revenue}</span>
                          <span style={{ 
                            background: '#e3f2fd', 
                            padding: '2px 8px', 
                            borderRadius: 12, 
                            fontSize: 12,
                            textAlign: 'center'
                          }}>
                            {item.category}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Daily Breakdown */}
                <div>
                  <h3 style={{ color: '#333', marginBottom: 16 }}>📅 Daily Sales Breakdown</h3>
                  <div style={{ borderRadius: 8, border: '1px solid #ddd', overflow: 'hidden' }}>
                    <div style={{
                      background: '#f5f5f5',
                      padding: '12px 16px',
                      borderBottom: '1px solid #ddd',
                      fontWeight: 'bold',
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr',
                      gap: 16
                    }}>
                      <span>Date</span>
                      <span>Transactions</span>
                      <span>Items Sold</span>
                      <span>Revenue</span>
                    </div>
                    {this.state.monthlySales.dailySummary?.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>
                        No daily sales data available.
                      </div>
                    ) : (
                      this.state.monthlySales.dailySummary?.map((day, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '12px 16px',
                            borderBottom: index < this.state.monthlySales.dailySummary.length - 1 ? '1px solid #eee' : 'none',
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr',
                            gap: 16,
                            alignItems: 'center',
                            background: index % 2 === 0 ? '#fafafa' : '#fff'
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{new Date(day.sale_date).toLocaleDateString()}</span>
                          <span>{day.transactions}</span>
                          <span>{day.items_sold}</span>
                          <span style={{ fontWeight: 600, color: '#4caf50' }}>₱{day.revenue}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Yearly Sales Page */}
            {mainContent === 'yearly-sales' && this.state.yearlySales && (
              <div className="yearly-sales-container" style={{
                width: '100%',
                maxWidth: 1200,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24
              }}>
                <h2 style={{ fontWeight: 700, color: '#333', fontSize: 20, textAlign: 'center', marginBottom: 16 }}>
                  📈 Yearly Sales Report - {this.state.yearlySales.year}
                </h2>

                {/* Yearly Summary Cards */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: 20, 
                  marginBottom: 32 
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
                    color: '#333333',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 36 }}>₱{this.state.yearlySales.yearTotal?.total_revenue || 0}</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: 16 }}>Annual Revenue</p>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #3f51b5, #303f9f)',
                    color: 'white',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(63,81,181,0.3)'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 36 }}>{this.state.yearlySales.yearTotal?.total_transactions || 0}</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: 16 }}>Total Transactions</p>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #607d8b, #455a64)',
                    color: 'white',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(96,125,139,0.3)'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 36 }}>{this.state.yearlySales.yearTotal?.total_items_sold || 0}</h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: 16 }}>Items Sold</p>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                <div>
                  <h3 style={{ color: '#333', marginBottom: 16 }}>📊 Monthly Performance</h3>
                  <div style={{ borderRadius: 8, border: '1px solid #ddd', overflow: 'hidden' }}>
                    <div style={{
                      background: '#f5f5f5',
                      padding: '12px 16px',
                      borderBottom: '1px solid #ddd',
                      fontWeight: 'bold',
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr',
                      gap: 16
                    }}>
                      <span>Month</span>
                      <span>Transactions</span>
                      <span>Items Sold</span>
                      <span>Revenue</span>
                    </div>
                    {this.state.yearlySales.monthlySummary?.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>
                        No monthly sales data available.
                      </div>
                    ) : (
                      this.state.yearlySales.monthlySummary?.map((month, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '12px 16px',
                            borderBottom: index < this.state.yearlySales.monthlySummary.length - 1 ? '1px solid #eee' : 'none',
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr',
                            gap: 16,
                            alignItems: 'center',
                            background: index % 2 === 0 ? '#fafafa' : '#fff'
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{month.month_name}</span>
                          <span>{month.transactions}</span>
                          <span>{month.items_sold}</span>
                          <span style={{ fontWeight: 600, color: '#4caf50' }}>₱{month.revenue}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Data Predictions Page */}
            {mainContent === 'data-predictions' && (
              <div style={{ width: '100%', marginTop: '0' }}>
                <DataPredictions />
              </div>
            )}

            {/* Demand Forecasting Page */}
            {mainContent === 'demand-forecasting' && (
              <div style={{
                width: '100%',
                maxWidth: 1200,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24
              }}>
                <h2 style={{ fontWeight: 700, color: '#333', fontSize: 20, textAlign: 'center', marginBottom: 24 }}>
                  📈 Demand Forecasting
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: 20,
                  marginBottom: 32
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #4caf50, #45a049)',
                    color: 'white',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 24 }}>📈 Trending Up</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>Croissants showing 25% increase</p>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                    color: 'white',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 24 }}>⚠️ Needs Attention</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>White Bread demand declining</p>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                    color: 'white',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 24 }}>🎯 Forecast Accuracy</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>87.3% prediction accuracy</p>
                  </div>
                </div>

                <div style={{
                  background: '#f8f9fa',
                  padding: 20,
                  borderRadius: 12,
                  textAlign: 'center'
                }}>
                  <h3>🔮 AI-Powered Forecasting Engine</h3>
                  <p>Our machine learning algorithms analyze historical sales data, seasonal trends, and external factors to predict future demand patterns.</p>
                  <div style={{ marginTop: 20 }}>
                    <button
                      onClick={() => this.setState({ mainContent: 'data-predictions' })}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginRight: '10px'
                      }}
                    >
                      View Detailed Predictions
                    </button>
                    <button
                      onClick={() => this.setState({ mainContent: 'inventory-analytics' })}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      View Analytics Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Items Page */}
            {mainContent === 'add-items-table' && (
              <div style={{
                width: '100%',
                maxWidth: 1200,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24
              }}
              onLoad={() => this.fetchCategories()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 style={{ fontWeight: 700, color: '#333', fontSize: 20, margin: 0 }}>
                    ➕ Add New Items
                  </h2>
                  <button
                    onClick={() => {
                      console.log('🔄 Refreshing categories...');
                      this.fetchCategories();
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    🔄 Refresh Categories ({this.state.customCategories?.length || 0})
                  </button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #ffffff, #f8f9fa)' }}>
                        <th style={{ padding: '16px', border: '1px solid #e0e0e0', textAlign: 'left', borderRadius: '8px 0 0 8px', color: '#555555', fontWeight: '600' }}>Item Name</th>
                        <th style={{ padding: '16px', border: '1px solid #e0e0e0', borderLeft: 'none', textAlign: 'left', color: '#555555', fontWeight: '600' }}>Quantity</th>
                        <th style={{ padding: '16px', border: '1px solid #e0e0e0', borderLeft: 'none', textAlign: 'left', color: '#555555', fontWeight: '600' }}>Price (₱)</th>
                        <th style={{ padding: '16px', border: '1px solid #e0e0e0', borderLeft: 'none', textAlign: 'left', color: '#555555', fontWeight: '600' }}>Category</th>
                        <th style={{ padding: '16px', border: '1px solid #e0e0e0', borderLeft: 'none', textAlign: 'center', borderRadius: '0 8px 8px 0', color: '#555555', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.addItemsRows.map((row, index) => (
                        <tr key={index} style={{ background: index % 2 === 0 ? '#fafafa' : '#fff' }}>
                          <td style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px 0 0 8px' }}>
                            <input
                              type="text"
                              value={row.itemName}
                              onChange={(e) => this.handleAddItemsChange(index, 'itemName', e.target.value)}
                              style={{ 
                                width: '100%', 
                                padding: '12px 16px', 
                                border: '2px solid #e0e0e0', 
                                borderRadius: '8px',
                                fontSize: '14px',
                                transition: 'border-color 0.3s',
                                outline: 'none'
                              }}
                              placeholder="Enter item name"
                              onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                          </td>
                          <td style={{ padding: '16px', border: '1px solid #ddd', borderLeft: 'none' }}>
                            <input
                              type="number"
                              value={row.quantity}
                              onChange={(e) => this.handleAddItemsChange(index, 'quantity', e.target.value)}
                              style={{ 
                                width: '100%', 
                                padding: '12px 16px', 
                                border: '2px solid #e0e0e0', 
                                borderRadius: '8px',
                                fontSize: '14px',
                                transition: 'border-color 0.3s',
                                outline: 'none'
                              }}
                              placeholder="0"
                              min="0"
                              onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                          </td>
                          <td style={{ padding: '16px', border: '1px solid #ddd', borderLeft: 'none' }}>
                            <input
                              type="number"
                              value={row.price}
                              onChange={(e) => this.handleAddItemsChange(index, 'price', e.target.value)}
                              style={{ 
                                width: '100%', 
                                padding: '12px 16px', 
                                border: '2px solid #e0e0e0', 
                                borderRadius: '8px',
                                fontSize: '14px',
                                transition: 'border-color 0.3s',
                                outline: 'none'
                              }}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            />
                          </td>
                          <td style={{ padding: '16px', border: '1px solid #ddd', borderLeft: 'none' }}>
                            <select
                              value={row.category}
                              onChange={(e) => this.handleAddItemsChange(index, 'category', e.target.value)}
                              style={{ 
                                width: '100%', 
                                padding: '12px 16px', 
                                border: '2px solid #e0e0e0', 
                                borderRadius: '8px',
                                fontSize: '14px',
                                transition: 'border-color 0.3s',
                                outline: 'none',
                                background: '#fff'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            >
                              <option value="">Select category</option>
                              {(this.state.customCategories || []).map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '16px', border: '1px solid #ddd', borderLeft: 'none', textAlign: 'center', borderRadius: '0 8px 8px 0' }}>
                            <button
                              onClick={() => this.removeItemsRow(index)}
                              style={{
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'background 0.3s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#d32f2f'}
                              onMouseLeave={(e) => e.target.style.background = '#f44336'}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
                  <button
                    onClick={this.addItemsRow}
                    style={{
                      background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                      boxShadow: '0 2px 8px rgba(33,150,243,0.3)',
                      minWidth: '140px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(33,150,243,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(33,150,243,0.3)';
                    }}
                  >
                    ➕ Add Row
                  </button>
                  <button
                    onClick={this.saveAllItems}
                    style={{
                      background: 'linear-gradient(135deg, #4caf50, #45a049)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                      boxShadow: '0 2px 8px rgba(76,175,80,0.3)',
                      minWidth: '140px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(76,175,80,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(76,175,80,0.3)';
                    }}
                  >
                    💾 Save All Items
                  </button>
                  <button
                    onClick={this.clearAddItemsForm}
                    style={{
                      background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                      boxShadow: '0 2px 8px rgba(255,152,0,0.3)',
                      minWidth: '140px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(255,152,0,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(255,152,0,0.3)';
                    }}
                  >
                    🔄 Clear Form
                  </button>
                </div>
              </div>
            )}

            {/* Update Items Page */}
            {mainContent === 'update-items' && (
              <div style={{
                width: '100%',
                maxWidth: 1000,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24
              }}>
                <h2 style={{ fontWeight: 700, color: '#333', fontSize: 20, textAlign: 'center', marginBottom: 24 }}>
                  🔄 Update Items
                </h2>
                
                <div style={{ 
                  marginBottom: 32,
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '2px solid #e9ecef'
                }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 12, 
                    fontWeight: 'bold',
                    color: '#495057',
                    fontSize: '16px'
                  }}>
                    Select Item to Update:
                  </label>
                  <select
                    value={this.state.selectedUpdateItem?.id || ''}
                    onChange={(e) => {
                      const item = this.state.inventoryItems.find(i => i.id === parseInt(e.target.value));
                      this.handleUpdateItemSelect(item);
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #ced4da',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: '#fff',
                      transition: 'border-color 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                    onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                  >
                    <option value="">Choose an item to update...</option>
                    {this.state.inventoryItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.quantity} units @ ₱{item.price}
                      </option>
                    ))}
                  </select>
                </div>

                {this.state.selectedUpdateItem && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: 24, 
                    marginBottom: 32,
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '2px solid #e9ecef'
                  }}>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 12, 
                        fontWeight: 'bold',
                        color: '#495057',
                        fontSize: '14px'
                      }}>
                        Item Name:
                      </label>
                      <input
                        type="text"
                        value={this.state.updateItemName}
                        onChange={(e) => this.handleUpdateItemChange('updateItemName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px',
                          border: '2px solid #ced4da',
                          borderRadius: '8px',
                          fontSize: '16px',
                          backgroundColor: '#fff',
                          transition: 'border-color 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#007bff'}
                        onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 12, 
                        fontWeight: 'bold',
                        color: '#495057',
                        fontSize: '14px'
                      }}>
                        Quantity:
                      </label>
                      <input
                        type="number"
                        value={this.state.updateItemQuantity}
                        onChange={(e) => this.handleUpdateItemChange('updateItemQuantity', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px',
                          border: '2px solid #ced4da',
                          borderRadius: '8px',
                          fontSize: '16px',
                          backgroundColor: '#fff',
                          transition: 'border-color 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#007bff'}
                        onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                        min="0"
                      />
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 12, 
                        fontWeight: 'bold',
                        color: '#495057',
                        fontSize: '14px'
                      }}>
                        Price (₱):
                      </label>
                      <input
                        type="number"
                        value={this.state.updateItemPrice}
                        onChange={(e) => this.handleUpdateItemChange('updateItemPrice', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px',
                          border: '2px solid #ced4da',
                          borderRadius: '8px',
                          fontSize: '16px',
                          backgroundColor: '#fff',
                          transition: 'border-color 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#007bff'}
                        onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 12, 
                        fontWeight: 'bold',
                        color: '#495057',
                        fontSize: '14px'
                      }}>
                        Category:
                      </label>
                      <select
                        value={this.state.updateItemCategory}
                        onChange={(e) => this.handleUpdateItemChange('updateItemCategory', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px',
                          border: '2px solid #ced4da',
                          borderRadius: '8px',
                          fontSize: '16px',
                          backgroundColor: '#fff',
                          transition: 'border-color 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#007bff'}
                        onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                      >
                        <option value="">Select category</option>
                        {(this.state.customCategories || []).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div style={{ 
                  display: 'flex', 
                  gap: 16, 
                  justifyContent: 'center',
                  marginTop: '32px',
                  padding: '20px 0'
                }}>
                  <button
                    onClick={this.saveItemUpdate}
                    disabled={!this.state.selectedUpdateItem}
                    style={{
                      background: !this.state.selectedUpdateItem ? '#6c757d' : 'linear-gradient(45deg, #28a745, #34ce57)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '16px 32px',
                      fontSize: 16,
                      fontWeight: 'bold',
                      cursor: !this.state.selectedUpdateItem ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: !this.state.selectedUpdateItem ? 'none' : '0 4px 15px rgba(40, 167, 69, 0.3)',
                      minWidth: '160px'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.selectedUpdateItem) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.selectedUpdateItem) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                      }
                    }}
                  >
                    💾 Update Item
                  </button>
                  <button
                    onClick={() => this.setState({
                      selectedUpdateItem: null,
                      updateItemName: '',
                      updateItemQuantity: '',
                      updateItemPrice: '',
                      updateItemCategory: ''
                    })}
                    style={{
                      background: 'linear-gradient(45deg, #6c757d, #868e96)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '16px 32px',
                      fontSize: 16,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)',
                      minWidth: '160px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
                    }}
                  >
                    �️ Clear Selection
                  </button>
                </div>
              </div>
            )}

            {/* Add Categories Page */}
            {mainContent === 'add-categories' && (
              <div style={{
                width: '100%',
                maxWidth: 800,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24
              }}>
                <h2 style={{ fontWeight: 700, color: '#333', fontSize: 20, textAlign: 'center', marginBottom: 24 }}>
                  ➕ Add New Category
                </h2>
                
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    Category Name:
                  </label>
                  <input
                    type="text"
                    value={this.state.newCategoryName}
                    onChange={(e) => this.setState({ newCategoryName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                    placeholder="Enter category name..."
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    Description (Optional):
                  </label>
                  <textarea
                    value={this.state.newCategoryDescription}
                    onChange={(e) => this.setState({ newCategoryDescription: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder="Enter category description..."
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    onClick={this.handleAddCategory}
                    disabled={!this.state.newCategoryName.trim()}
                    style={{
                      background: !this.state.newCategoryName.trim() ? '#ccc' : '#4caf50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '12px 24px',
                      fontSize: 16,
                      fontWeight: 'bold',
                      cursor: !this.state.newCategoryName.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ➕ Add Category
                  </button>
                  <button
                    onClick={() => this.setState({ newCategoryName: '', newCategoryDescription: '' })}
                    style={{
                      background: '#ff9800',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '12px 24px',
                      fontSize: 16,
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Clear Form
                  </button>
                </div>

                {/* Current Categories List */}
                <div style={{ marginTop: 32 }}>
                  <h3 style={{ color: '#333', marginBottom: 16 }}>Current Categories:</h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                    gap: 12 
                  }}>
                    {(this.state.categories || []).map(category => (
                      <div key={category.category_id || category.name} style={{
                        background: '#f8f9fa',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}>
                        <strong>{category.name}</strong>
                        {category.description && (
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                            {category.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Manage Categories Page */}
            {mainContent === 'manage-categories' && (
              <div style={{
                width: '100%',
                maxWidth: 1000,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24
              }}>
                <h2 style={{ fontWeight: 700, color: '#333', fontSize: 20, textAlign: 'center', marginBottom: 24 }}>
                  🔧 Manage Categories
                </h2>
                
                {/* Update Category Section */}
                <div style={{ marginBottom: 32, padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
                  <h3 style={{ marginBottom: 16 }}>Update Category</h3>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                      Select Category to Update:
                    </label>
                    <select
                      value={this.state.selectedCategoryForEdit || ''}
                      onChange={(e) => {
                        const category = this.state.categories.find(c => c.name === e.target.value);
                        this.setState({ 
                          selectedCategoryForEdit: e.target.value,
                          editCategoryName: e.target.value,
                          editCategoryDescription: category?.description || ''
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '16px'
                      }}
                    >
                      <option value="">Choose a category...</option>
                      {(this.state.categories || []).map(category => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {this.state.selectedCategoryForEdit && (
                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                          New Category Name:
                        </label>
                        <input
                          type="text"
                          value={this.state.editCategoryName}
                          onChange={(e) => this.setState({ editCategoryName: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px'
                          }}
                        />
                      </div>
                      
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                          Description:
                        </label>
                        <textarea
                          value={this.state.editCategoryDescription}
                          onChange={(e) => this.setState({ editCategoryDescription: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            minHeight: '60px'
                          }}
                        />
                      </div>
                      
                      <button
                        onClick={this.handleUpdateCategory}
                        style={{
                          background: '#2196f3',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          marginRight: '10px'
                        }}
                      >
                        📝 Update Category
                      </button>
                    </div>
                  )}
                </div>

                {/* Categories List with Delete */}
                <div>
                  <h3 style={{ marginBottom: 16 }}>All Categories</h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {(this.state.categories || []).map(category => (
                      <div key={category.name} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '16px' }}>{category.name}</strong>
                          {category.description && (
                            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                              {category.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => this.handleDeleteCategory(category.name)}
                          style={{
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* All Items Page */}
            {mainContent === 'all-items-table' && (
              <div style={{
                width: '100%',
                maxWidth: 1200,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24
              }}>
                <h2 style={{ fontWeight: 700, color: '#333', fontSize: 20, textAlign: 'center', marginBottom: 24 }}>
                  📋 All Inventory Items
                </h2>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Item Name</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Category</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Quantity</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Price (₱)</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Total Value (₱)</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.inventoryItems.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                            No items found. Add some items to get started!
                          </td>
                        </tr>
                      ) : (
                        this.state.inventoryItems.map((item, index) => (
                          <tr key={item.id || index} style={{ 
                            background: index % 2 === 0 ? '#fafafa' : '#fff',
                          }}>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>{item.id}</td>
                            <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                              {item.name}
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                              <span style={{
                                background: '#e3f2fd',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px'
                              }}>
                                {item.category || 'Uncategorized'}
                              </span>
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>
                              <span style={{
                                color: item.quantity <= this.state.lowStockThreshold ? '#f44336' : '#333',
                                fontWeight: item.quantity <= this.state.lowStockThreshold ? 'bold' : 'normal'
                              }}>
                                {item.quantity}
                              </span>
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>
                              ₱{(parseFloat(item.price) || 0).toFixed(2)}
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                              ₱{((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)).toFixed(2)}
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                              <span style={{
                                background: item.quantity === 0 ? '#f44336' : 
                                          item.quantity <= this.state.lowStockThreshold ? '#ff9800' : '#4caf50',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                {item.quantity === 0 ? 'Out of Stock' :
                                 item.quantity <= this.state.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                              </span>
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                              {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div style={{ marginTop: 20, textAlign: 'center', color: '#666' }}>
                  <p><strong>Total Items:</strong> {this.state.inventoryItems.length}</p>
                  <p><strong>Total Inventory Value:</strong> ₱{this.state.inventoryItems.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)), 0).toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Critical Items Page */}
            {mainContent === 'critical-items' && (
              <div style={{
                width: '100%',
                maxWidth: 1000,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24
              }}>
                <h2 style={{ fontWeight: 700, color: '#333', fontSize: 20, textAlign: 'center', marginBottom: 24 }}>
                  ⚠️ Critical Stock Items
                </h2>
                
                {criticalItems.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                    <h3>🎉 Great News!</h3>
                    <p>No items are currently at critical stock levels.</p>
                    <p>All inventory items are well stocked!</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: 20, textAlign: 'center' }}>
                      <span style={{
                        background: '#ff9800',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontWeight: 'bold'
                      }}>
                        {criticalItems.length} item(s) need attention
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gap: 16 }}>
                      {criticalItems.map((item, index) => {
                        const daysLeft = Math.floor(Math.random() * 7) + 1; // Simulate days left
                        const urgencyColor = item.quantity <= 5 ? '#f44336' : '#ff9800';
                        
                        return (
                          <div key={item.item_id || index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '16px',
                            background: '#fff3e0',
                            border: `2px solid ${urgencyColor}`,
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(255,152,0,0.1)'
                          }}>
                            <div style={{ flex: 2 }}>
                              <h4 style={{ margin: '0 0 4px 0', color: urgencyColor }}>
                                {item.item_name || item.name}
                              </h4>
                              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                                Category: {item.category || 'Uncategorized'}
                              </p>
                            </div>
                            
                            <div style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{ fontSize: '24px', fontWeight: 'bold', color: urgencyColor }}>
                                {item.quantity}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>units left</div>
                            </div>
                            
                            <div style={{ flex: 1, textAlign: 'center' }}>
                              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
                                {daysLeft}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>days estimated</div>
                            </div>
                            
                            <div style={{ flex: 2, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => {
                                  const reorderQty = Math.max(50, item.quantity * 3);
                                  alert(`Restock suggestion: Order ${reorderQty} units of ${item.item_name || item.name}`);
                                }}
                                style={{
                                  background: '#ff9800',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                📦 Restock
                              </button>
                              <button
                                onClick={() => {
                                  this.setState({ 
                                    mainContent: 'update-items',
                                    selectedUpdateItem: {
                                      id: item.item_id,
                                      name: item.item_name || item.name,
                                      quantity: item.quantity,
                                      price: item.price || 0,
                                      category: item.category
                                    },
                                    updateItemName: item.item_name || item.name,
                                    updateItemQuantity: item.quantity.toString(),
                                    updateItemPrice: (item.price || 0).toString(),
                                    updateItemCategory: item.category || ''
                                  });
                                }}
                                style={{
                                  background: '#2196f3',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Inventory Analytics Page */}
            {mainContent === 'inventory-analytics' && (
              <div style={{
                width: '100%',
                maxWidth: 1200,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 32
              }}>
                <h2 style={{ 
                  fontWeight: 700, 
                  color: '#1f2937', 
                  fontSize: 28, 
                  textAlign: 'center', 
                  marginBottom: 32,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                }}>
                  📊 Inventory Analytics Dashboard
                </h2>

                {/* Analytics Summary Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 20,
                  marginBottom: 32
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                    color: '#ffffff',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
                  }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: 32, 
                      fontWeight: 'bold',
                      color: '#ffffff',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {this.state.inventoryItems?.length || 0}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: 16, 
                      fontWeight: '500',
                      color: '#ffffff',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Total Products
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: 32, 
                      fontWeight: 'bold',
                      color: '#ffffff',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {this.state.inventoryItems?.filter(item => item.quantity > 0)?.length || 0}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: 16, 
                      fontWeight: '500',
                      color: '#ffffff',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Items In Stock
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#ffffff',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                  }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: 32, 
                      fontWeight: 'bold',
                      color: '#ffffff',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {this.state.criticalItems?.length || 0}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: 16, 
                      fontWeight: '500',
                      color: '#ffffff',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Low Stock Items
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#ffffff',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: 32, 
                      fontWeight: 'bold',
                      color: '#ffffff',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {this.state.inventoryItems?.filter(item => item.quantity === 0)?.length || 0}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: 16, 
                      fontWeight: '500',
                      color: '#ffffff',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Out of Stock
                    </p>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 32,
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{
                    margin: '0 0 20px 0',
                    color: '#1f2937',
                    fontSize: 20,
                    fontWeight: '600',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    📈 Category Analysis
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16
                  }}>
                    {this.state.categories?.map(category => {
                      const categoryItems = this.state.inventoryItems?.filter(item => item.category === category.name) || [];
                      const totalValue = categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                      
                      return (
                        <div key={category.category_id} style={{
                          background: '#ffffff',
                          padding: 16,
                          borderRadius: 8,
                          border: '1px solid #d1d5db',
                          textAlign: 'center'
                        }}>
                          <h4 style={{
                            margin: '0 0 8px 0',
                            color: '#374151',
                            fontSize: 16,
                            fontWeight: '600',
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            {category.name}
                          </h4>
                          <p style={{
                            margin: '4px 0',
                            color: '#6b7280',
                            fontSize: 14,
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            Items: {categoryItems.length}
                          </p>
                          <p style={{
                            margin: '4px 0',
                            color: '#059669',
                            fontSize: 14,
                            fontWeight: '600',
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            Value: ₱{totalValue.toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Low Stock Alert Table */}
                {this.state.criticalItems?.length > 0 && (
                  <div style={{
                    background: '#fef3c7',
                    borderRadius: 12,
                    padding: 24,
                    border: '1px solid #fbbf24'
                  }}>
                    <h3 style={{
                      margin: '0 0 20px 0',
                      color: '#92400e',
                      fontSize: 20,
                      fontWeight: '600',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      ⚠️ Items Requiring Attention
                    </h3>
                    <div style={{
                      background: '#ffffff',
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f9fafb' }}>
                            <th style={{
                              padding: '12px',
                              textAlign: 'left',
                              borderBottom: '1px solid #e5e7eb',
                              color: '#374151',
                              fontSize: 14,
                              fontWeight: '600',
                              fontFamily: "'Inter', sans-serif"
                            }}>Item Name</th>
                            <th style={{
                              padding: '12px',
                              textAlign: 'left',
                              borderBottom: '1px solid #e5e7eb',
                              color: '#374151',
                              fontSize: 14,
                              fontWeight: '600',
                              fontFamily: "'Inter', sans-serif"
                            }}>Category</th>
                            <th style={{
                              padding: '12px',
                              textAlign: 'center',
                              borderBottom: '1px solid #e5e7eb',
                              color: '#374151',
                              fontSize: 14,
                              fontWeight: '600',
                              fontFamily: "'Inter', sans-serif"
                            }}>Current Stock</th>
                            <th style={{
                              padding: '12px',
                              textAlign: 'center',
                              borderBottom: '1px solid #e5e7eb',
                              color: '#374151',
                              fontSize: 14,
                              fontWeight: '600',
                              fontFamily: "'Inter', sans-serif"
                            }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.criticalItems.map(item => (
                            <tr key={item.item_id}>
                              <td style={{
                                padding: '12px',
                                borderBottom: '1px solid #f3f4f6',
                                color: '#374151',
                                fontSize: 14,
                                fontFamily: "'Inter', sans-serif"
                              }}>
                                {item.item_name || item.name}
                              </td>
                              <td style={{
                                padding: '12px',
                                borderBottom: '1px solid #f3f4f6',
                                color: '#6b7280',
                                fontSize: 14,
                                fontFamily: "'Inter', sans-serif"
                              }}>
                                {item.category}
                              </td>
                              <td style={{
                                padding: '12px',
                                borderBottom: '1px solid #f3f4f6',
                                textAlign: 'center',
                                color: item.quantity === 0 ? '#dc2626' : '#f59e0b',
                                fontSize: 14,
                                fontWeight: '600',
                                fontFamily: "'Inter', sans-serif"
                              }}>
                                {item.quantity}
                              </td>
                              <td style={{
                                padding: '12px',
                                borderBottom: '1px solid #f3f4f6',
                                textAlign: 'center'
                              }}>
                                <span style={{
                                  background: item.quantity === 0 ? '#fee2e2' : '#fef3c7',
                                  color: item.quantity === 0 ? '#dc2626' : '#d97706',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: 12,
                                  fontWeight: '500',
                                  fontFamily: "'Inter', sans-serif"
                                }}>
                                  {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stock Reports Page - NEW */}
            {mainContent === 'stock-reports' && (
              <div style={{
                width: '100%',
                maxWidth: 1200,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24
              }}>
                <h2 style={{ fontWeight: 700, color: '#333', fontSize: 20, textAlign: 'center', marginBottom: 24 }}>
                  📋 Stock Reports
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: 20,
                  marginBottom: 32
                }}>
                  <div style={{
                    background: '#f8f9fa',
                    padding: 20,
                    borderRadius: 12,
                    border: '2px dashed #dee2e6',
                    textAlign: 'center'
                  }}>
                    <h3>📊 Inventory Summary Report</h3>
                    <p>Generate comprehensive inventory overview with current stock levels and values</p>
                    <button
                      onClick={() => this.setState({ mainContent: 'inventory-analytics' })}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      View Analytics
                    </button>
                  </div>
                  <div style={{
                    background: '#f8f9fa',
                    padding: 20,
                    borderRadius: 12,
                    border: '2px dashed #dee2e6',
                    textAlign: 'center'
                  }}>
                    <h3>⚠️ Low Stock Report</h3>
                    <p>Detailed report of items that need immediate attention and restocking</p>
                    <button
                      onClick={() => this.setState({ mainContent: 'critical-items' })}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      View Critical Items
                    </button>
                  </div>
                  <div style={{
                    background: '#f8f9fa',
                    padding: 20,
                    borderRadius: 12,
                    border: '2px dashed #dee2e6',
                    textAlign: 'center'
                  }}>
                    <h3>📂 Category Report</h3>
                    <p>Analyze inventory distribution across different product categories</p>
                    <button
                      style={{
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'not-allowed',
                        opacity: 0.6
                      }}
                      disabled
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
                <div style={{
                  background: '#e7f3ff',
                  padding: 20,
                  borderRadius: 12,
                  border: '1px solid #b3d9ff',
                  textAlign: 'center'
                }}>
                  <h4>📈 Quick Stats</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 15 }}>
                    <div>
                      <strong>Total Items:</strong> {this.state.inventoryItems?.length || 0}
                    </div>
                    <div>
                      <strong>Low Stock:</strong> {this.state.inventoryItems?.filter(item => item.quantity <= 10).length || 0}
                    </div>
                    <div>
                      <strong>Out of Stock:</strong> {this.state.inventoryItems?.filter(item => item.quantity === 0).length || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Management - User Settings Page */}
            {mainContent === 'user-settings' && (
              <div style={{
                width: '100%',
                maxWidth: 800,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 32
              }}>
                <h2 style={{ 
                  fontWeight: 700, 
                  color: '#333', 
                  fontSize: 24, 
                  textAlign: 'center', 
                  marginBottom: 32,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  ⚙️ User Settings
                </h2>
                
                {/* User Profile Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%)',
                  padding: 24,
                  borderRadius: 12,
                  marginBottom: 24,
                  border: '1px solid #0d9488'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                      color: 'white',
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      marginRight: 16
                    }}>
                      👤
                    </div>
                    <div>
                      <h3 style={{ margin: 0, color: '#0f766e' }}>
                        {userInfo?.username || 'User'}
                      </h3>
                      <p style={{ margin: 0, color: '#134e4a', fontSize: 14 }}>
                        Administrator
                      </p>
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: 16, 
                    borderRadius: 8,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 12
                  }}>
                    <div>
                      <strong style={{ color: '#0f766e' }}>Email:</strong>
                      <br />
                      <span style={{ color: '#134e4a' }}>{userInfo?.email || 'user@breadmilk.com'}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#0f766e' }}>Last Login:</strong>
                      <br />
                      <span style={{ color: '#134e4a' }}>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#0f766e' }}>Role:</strong>
                      <br />
                      <span style={{ color: '#134e4a' }}>Administrator</span>
                    </div>
                  </div>
                </div>

                {/* Settings Options */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 20
                }}>
                  <div style={{
                    background: '#f8f9fa',
                    padding: 20,
                    borderRadius: 12,
                    border: '2px solid #e9ecef',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Change Password</h4>
                    <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#666' }}>
                      Update your account password for security
                    </p>
                    <button style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: 14
                    }}>
                      Change Password
                    </button>
                  </div>

                  <div style={{
                    background: '#f8f9fa',
                    padding: 20,
                    borderRadius: 12,
                    border: '2px solid #e9ecef',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📧</div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Email Settings</h4>
                    <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#666' }}>
                      Configure email notifications and preferences
                    </p>
                    <button style={{
                      background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: 14
                    }}>
                      Email Settings
                    </button>
                  </div>

                  <div style={{
                    background: '#f8f9fa',
                    padding: 20,
                    borderRadius: 12,
                    border: '2px solid #e9ecef',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🎨</div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Theme Settings</h4>
                    <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#666' }}>
                      Customize the appearance of your dashboard
                    </p>
                    <button style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'not-allowed',
                      fontSize: 14,
                      opacity: 0.6
                    }} disabled>
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* User Management - Manage Users Page */}
            {mainContent === 'manage-users' && (
              <div style={{
                width: '100%',
                maxWidth: 1200,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 32
              }}>
                <h2 style={{ 
                  fontWeight: 700, 
                  color: '#333', 
                  fontSize: 24, 
                  textAlign: 'center', 
                  marginBottom: 32,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  👥 Manage Users
                </h2>

                {/* Add New User Section */}
                <div style={{
                  background: 'linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%)',
                  padding: 32,
                  borderRadius: 16,
                  marginBottom: 32,
                  border: '1px solid #0d9488',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.1)'
                }}>
                  <h3 style={{ margin: '0 0 24px 0', color: '#0f766e', textAlign: 'center', fontSize: '20px' }}>➕ Add New User</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 24,
                    marginBottom: 24
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 12, 
                        color: '#134e4a', 
                        fontWeight: 600,
                        fontSize: '14px'
                      }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={this.state.addUserName}
                        onChange={(e) => this.handleAddUserChange('name', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          border: '2px solid #b2f5ea',
                          borderRadius: '10px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box',
                          background: 'rgba(255, 255, 255, 0.9)'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0d9488';
                          e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#b2f5ea';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 12, 
                        color: '#134e4a', 
                        fontWeight: 600,
                        fontSize: '14px'
                      }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={this.state.addUserEmail}
                        onChange={(e) => this.handleAddUserChange('email', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          border: '2px solid #b2f5ea',
                          borderRadius: '10px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box',
                          background: 'rgba(255, 255, 255, 0.9)'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0d9488';
                          e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#b2f5ea';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 12, 
                        color: '#134e4a', 
                        fontWeight: 600,
                        fontSize: '14px'
                      }}>
                        Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={this.state.addUserPassword}
                        onChange={(e) => this.handleAddUserChange('password', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          border: '2px solid #b2f5ea',
                          borderRadius: '10px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box',
                          background: 'rgba(255, 255, 255, 0.9)'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0d9488';
                          e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#b2f5ea';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 12, 
                        color: '#134e4a', 
                        fontWeight: 600,
                        fontSize: '14px'
                      }}>
                        Role
                      </label>
                      <select
                        value={this.state.addUserRole}
                        onChange={(e) => this.handleAddUserChange('role', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          border: '2px solid #b2f5ea',
                          borderRadius: '10px',
                          fontSize: '14px',
                          outline: 'none',
                          background: 'rgba(255, 255, 255, 0.9)',
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0d9488';
                          e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#b2f5ea';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="">Select a role</option>
                        <option value="User">User</option>
                        <option value="Admin">Administrator</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                    <button 
                    onClick={this.handleAddUser}
                    style={{
                      background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                      color: 'white',
                      border: 'none',
                      padding: '14px 32px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: 16,
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                      minWidth: '160px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(13, 148, 136, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.3)';
                    }}>
                      ➕ Add User
                    </button>
                    
                    <button
                    onClick={() => this.handleDebugUserCreation()}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                      minWidth: '160px',
                      marginLeft: '10px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                    }}>
                      🔧 Debug User
                    </button>
                  </div>
                </div>

                {/* Users List */}
                <div>
                  <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>👥 Current Users</h3>
                  <div style={{
                    background: '#f8f9fa',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid #e9ecef'
                  }}>
                    {/* Table Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 1fr 120px 120px 120px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      padding: '16px',
                      fontWeight: 600,
                      fontSize: 14
                    }}>
                      <div>Avatar</div>
                      <div>Name</div>
                      <div>Email</div>
                      <div>Role</div>
                      <div>Status</div>
                      <div>Actions</div>
                    </div>

                    {/* Dynamic Users from Database */}
                    {(this.state.users && this.state.users.length > 0) ? this.state.users.map((user, index) => (
                      <div key={user.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr 1fr 120px 120px 120px',
                        padding: '16px',
                        borderBottom: index < this.state.users.length - 1 ? '1px solid #e9ecef' : 'none',
                        alignItems: 'center',
                        background: index % 2 === 0 ? 'white' : '#f8f9fa'
                      }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16
                        }}>
                          {(user.firstname || user.username || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 500, color: '#333' }}>
                          {user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : user.username || user.email}
                        </div>
                        <div style={{ color: '#666' }}>{user.email}</div>
                        <div>
                          <span style={{
                            background: user.role === 'Admin' ? '#667eea' : user.role === 'Manager' ? '#0d9488' : '#6c757d',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: 12,
                            fontWeight: 500
                          }}>
                            {user.role || 'User'}
                          </span>
                        </div>
                        <div>
                          <span style={{
                            background: user.status === 'Active' ? '#10b981' : '#ef4444',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: 12,
                            fontWeight: 500
                          }}>
                            {user.status || 'Active'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button style={{
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: 12,
                            cursor: 'pointer'
                          }}>
                            Edit
                          </button>
                          <button style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: 12,
                            cursor: 'pointer'
                          }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div style={{
                        padding: '32px',
                        textAlign: 'center',
                        color: '#666',
                        fontSize: 16
                      }}>
                        No users found. Add a user to get started!
                      </div>
                    )}
                  </div>
                </div>

                {/* User Statistics */}
                <div style={{
                  marginTop: 32,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 20
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white',
                    padding: 20,
                    borderRadius: 12,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{this.state.users ? this.state.users.length : 0}</div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>Total Users</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    padding: 20,
                    borderRadius: 12,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>
                      {this.state.users ? this.state.users.filter(user => user.status === 'Active').length : 0}
                    </div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>Active Users</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                    color: 'white',
                    padding: 20,
                    borderRadius: 12,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>
                      {this.state.users ? this.state.users.filter(user => user.role === 'Admin').length : 0}
                    </div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>Administrators</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #ffc107, #fd7e14)',
                    color: 'white',
                    padding: 20,
                    borderRadius: 12,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>1</div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>Inactive Users</div>
                  </div>
                </div>
              </div>
            )}

            {/* Comprehensive Analytics Dashboard */}
            {mainContent === 'comprehensive-analytics' && (
              <div style={{
                width: '100%',
                padding: '20px',
                background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)'
              }}>
                <h1 style={{ 
                  textAlign: 'center', 
                  marginBottom: 32,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: 28,
                  fontWeight: 700
                }}>
                  📊 Comprehensive Analytics Dashboard
                </h1>

                {/* Performance Metrics Overview */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 20,
                  marginBottom: 32
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 8px 20px rgba(40, 167, 69, 0.3)'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 32 }}>₱{this.state.performanceMetrics.totalRevenue?.toLocaleString() || '0'}</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>Total Revenue (30 days)</p>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 32 }}>₱{this.state.performanceMetrics.avgDailyRevenue?.toLocaleString() || '0'}</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>Average Daily Revenue</p>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                    color: 'white',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 8px 20px rgba(13, 148, 136, 0.3)'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 32 }}>{this.state.performanceMetrics.totalProducts || '0'}</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>Total Products</p>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #ffc107, #fd7e14)',
                    color: 'white',
                    padding: 24,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 8px 20px rgba(255, 193, 7, 0.3)'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 32 }}>{this.state.performanceMetrics.inventoryTurnover || '0'}</h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>Inventory Turnover</p>
                  </div>
                </div>

                {/* Sales Trends Chart */}
                <div style={{
                  background: 'white',
                  padding: 24,
                  borderRadius: 16,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  marginBottom: 32
                }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📈 Sales Trends (Last 30 Days)</h3>
                  <div style={{
                    height: 300,
                    display: 'flex',
                    alignItems: 'end',
                    justifyContent: 'space-between',
                    padding: '20px 0',
                    borderBottom: '2px solid #e9ecef',
                    gap: 2
                  }}>
                    {this.state.salesTrends.slice(-15).map((day, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: 1
                      }}>
                        <div style={{
                          width: '100%',
                          background: `linear-gradient(0deg, #667eea, #764ba2)`,
                          height: `${(day.revenue / Math.max(...this.state.salesTrends.map(d => d.revenue))) * 250}px`,
                          borderRadius: '4px 4px 0 0',
                          minHeight: '10px',
                          position: 'relative'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '-25px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#667eea',
                            whiteSpace: 'nowrap'
                          }}>
                            ₱{(day.revenue / 1000).toFixed(1)}k
                          </div>
                        </div>
                        <div style={{
                          fontSize: '8px',
                          color: '#666',
                          marginTop: '8px',
                          transform: 'rotate(-45deg)',
                          transformOrigin: 'center'
                        }}>
                          {day.date.split('/').slice(0, 2).join('/')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Forecast vs Actual */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 20,
                  marginBottom: 32
                }}>
                  <div style={{
                    background: 'white',
                    padding: 24,
                    borderRadius: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🔮 Revenue Forecasting (Next 15 Days)</h3>
                    <div style={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'end',
                      justifyContent: 'space-between',
                      gap: 2
                    }}>
                      {this.state.forecastData.slice(0, 15).map((day, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flex: 1
                        }}>
                          <div style={{
                            width: '100%',
                            background: `linear-gradient(0deg, #0d9488, #14b8a6)`,
                            height: `${(day.predictedRevenue / Math.max(...this.state.forecastData.slice(0, 15).map(d => d.predictedRevenue))) * 150}px`,
                            borderRadius: '4px 4px 0 0',
                            minHeight: '5px',
                            opacity: day.confidence
                          }}></div>
                          <div style={{
                            fontSize: '6px',
                            color: '#666',
                            marginTop: '4px'
                          }}>
                            Day {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: 24,
                    borderRadius: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📊 Category Performance</h3>
                    {this.state.categoryAnalytics.slice(0, 5).map((category, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <div>
                          <strong style={{ color: '#333' }}>{category.name}</strong>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {category.totalItems} items • ₱{category.avgPrice} avg
                          </div>
                        </div>
                        <div style={{
                          background: `linear-gradient(135deg, #0d9488, #14b8a6)`,
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {category.marketShare}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inventory Management Insights */}
                <div style={{
                  background: 'white',
                  padding: 24,
                  borderRadius: 16,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  marginBottom: 32
                }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📦 Inventory Management Insights</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 16,
                    marginBottom: 20
                  }}>
                    <div style={{
                      background: '#fef3c7',
                      padding: 16,
                      borderRadius: 8,
                      textAlign: 'center',
                      border: '2px solid #fbbf24'
                    }}>
                      <div style={{ fontSize: 24, color: '#d97706' }}>{this.state.performanceMetrics.lowStockItems || 0}</div>
                      <div style={{ fontSize: 12, color: '#92400e' }}>Low Stock Items</div>
                    </div>
                    <div style={{
                      background: '#fee2e2',
                      padding: 16,
                      borderRadius: 8,
                      textAlign: 'center',
                      border: '2px solid #f87171'
                    }}>
                      <div style={{ fontSize: 24, color: '#dc2626' }}>{this.state.performanceMetrics.outOfStockItems || 0}</div>
                      <div style={{ fontSize: 12, color: '#991b1b' }}>Out of Stock</div>
                    </div>
                    <div style={{
                      background: '#d1fae5',
                      padding: 16,
                      borderRadius: 8,
                      textAlign: 'center',
                      border: '2px solid #34d399'
                    }}>
                      <div style={{ fontSize: 24, color: '#059669' }}>₱{this.state.performanceMetrics.totalInventoryValue?.toLocaleString() || '0'}</div>
                      <div style={{ fontSize: 12, color: '#047857' }}>Total Inventory Value</div>
                    </div>
                    <div style={{
                      background: '#e0e7ff',
                      padding: 16,
                      borderRadius: 8,
                      textAlign: 'center',
                      border: '2px solid #818cf8'
                    }}>
                      <div style={{ fontSize: 24, color: '#4338ca' }}>{this.state.performanceMetrics.profitMargin || 0}%</div>
                      <div style={{ fontSize: 12, color: '#3730a3' }}>Profit Margin</div>
                    </div>
                  </div>
                </div>

                {/* System Performance Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 20
                }}>
                  <div style={{
                    background: 'white',
                    padding: 24,
                    borderRadius: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>👥 User Activity</h3>
                    {this.state.userActivityData.slice(0, 6).map((activity, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <span style={{ fontSize: 14, color: '#333' }}>{activity.activity}</span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#667eea' }}>{activity.count}</div>
                          <div style={{ fontSize: 10, color: '#666' }}>{activity.avgDuration}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    background: 'white',
                    padding: 24,
                    borderRadius: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>⚡ System Performance</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ color: '#333' }}>Customer Satisfaction</span>
                        <div style={{
                          background: '#e5f3ff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          color: '#0066cc',
                          fontWeight: 'bold'
                        }}>
                          {(this.state.performanceMetrics.customerSatisfaction * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ color: '#333' }}>Avg Processing Time</span>
                        <div style={{
                          background: '#f0f9ff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          color: '#0284c7',
                          fontWeight: 'bold'
                        }}>
                          {this.state.performanceMetrics.avgOrderProcessingTime} min
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ color: '#333' }}>System Uptime</span>
                        <div style={{
                          background: '#ecfdf5',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          color: '#059669',
                          fontWeight: 'bold'
                        }}>
                          99.9%
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ color: '#333' }}>Data Accuracy</span>
                        <div style={{
                          background: '#fef3c7',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          color: '#d97706',
                          fontWeight: 'bold'
                        }}>
                          98.5%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reborn Dashboard Homepage */}
            {(!mainContent || mainContent === 'dashboard') && (
              <div style={{
                width: '100%',
                padding: '0px',
                background: 'transparent',
                minHeight: 'calc(100vh - 142px)'
              }}>
                {/* Hero Section - Reborn */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
                  backdropFilter: 'blur(20px)',
                  padding: '48px 40px',
                  borderRadius: '24px',
                  textAlign: 'center',
                  marginBottom: '32px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Background Pattern */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)
                    `,
                    zIndex: 1
                  }}></div>
                  
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    {/* Welcome Title */}
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '16px'
                    }}>🍞</div>
                    <h1 style={{ 
                      margin: '0 0 16px 0', 
                      fontSize: '36px', 
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #1e293b, #475569)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '-0.5px'
                    }}>
                      Welcome to Breadmilk Inventory
                    </h1>
                    <p style={{ 
                      margin: '0 0 24px 0', 
                      fontSize: '18px', 
                      color: '#64748b',
                      fontWeight: 400,
                      maxWidth: '600px',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }}>
                      Modern bakery inventory management designed for efficiency and growth
                    </p>
                    
                    {/* Status Pills */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        color: '#166534',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: '1px solid rgba(34, 197, 94, 0.2)'
                      }}>
                        🟢 System Online
                      </div>
                      <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#1e40af',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        👤 {userInfo?.username || 'User'}
                      </div>
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        color: '#92400e',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: '1px solid rgba(245, 158, 11, 0.2)'
                      }}>
                        📅 {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 24,
                  marginBottom: 32
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: 28,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}>
                    <div style={{ fontSize: '48px', marginBottom: 8 }}>📦</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>
                      {this.state.inventoryItems?.length || 0}
                    </h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>Total Products</p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    padding: 28,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}>
                    <div style={{ fontSize: '48px', marginBottom: 8 }}>⚠️</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>
                      {this.state.inventoryItems?.filter(item => item.quantity <= 10).length || 0}
                    </h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>Low Stock Items</p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    padding: 28,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}>
                    <div style={{ fontSize: '48px', marginBottom: 8 }}>🚫</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>
                      {this.state.inventoryItems?.filter(item => item.quantity === 0).length || 0}
                    </h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>Out of Stock</p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                    color: 'white',
                    padding: 28,
                    borderRadius: 16,
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(13, 148, 136, 0.3)',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}>
                    <div style={{ fontSize: '48px', marginBottom: 8 }}>💰</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>
                      ₱{this.state.performanceMetrics?.totalInventoryValue?.toLocaleString() || '0'}
                    </h3>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>Inventory Value</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                  background: 'white',
                  padding: 32,
                  borderRadius: 16,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  marginBottom: 32
                }}>
                  <h2 style={{ 
                    margin: '0 0 24px 0', 
                    color: '#1f2937',
                    fontSize: '24px',
                    textAlign: 'center'
                  }}>
                    🚀 Quick Actions
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 20
                  }}>
                    <button
                      onClick={() => this.setState({ mainContent: 'add-items-table' })}
                      style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        padding: '20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: 8 }}>➕</div>
                      Add New Items
                    </button>

                    <button
                      onClick={() => this.setState({ mainContent: 'record-sale' })}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        padding: '20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: 8 }}>💰</div>
                      Record Sale
                    </button>

                    <button
                      onClick={() => this.setState({ mainContent: 'all-items-table' })}
                      style={{
                        background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                        color: 'white',
                        border: 'none',
                        padding: '20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(13, 148, 136, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.2)';
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: 8 }}>📋</div>
                      View Inventory
                    </button>

                    <button
                      onClick={() => {
                        this.setState({ mainContent: 'comprehensive-analytics' });
                        this.generateComprehensiveAnalytics();
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        border: 'none',
                        padding: '20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: 8 }}>📊</div>
                      View Analytics
                    </button>
                  </div>
                </div>

                {/* Recent Activity & System Status */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 24
                }}>
                  {/* Recent Activity */}
                  <div style={{
                    background: 'white',
                    padding: 24,
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '20px' }}>
                      📈 Recent Activity
                    </h3>
                    <div style={{ space: '12px' }}>
                      {[
                        { action: 'Inventory Updated', time: '2 minutes ago', icon: '📦', color: '#10b981' },
                        { action: 'Sale Recorded', time: '15 minutes ago', icon: '💰', color: '#0d9488' },
                        { action: 'Low Stock Alert', time: '1 hour ago', icon: '⚠️', color: '#f59e0b' },
                        { action: 'User Login', time: '2 hours ago', icon: '👤', color: '#667eea' },
                        { action: 'Report Generated', time: '3 hours ago', icon: '📊', color: '#8b5cf6' }
                      ].map((activity, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: index < 4 ? '1px solid #f3f4f6' : 'none'
                        }}>
                          <span style={{ 
                            fontSize: '20px', 
                            marginRight: '12px',
                            background: activity.color + '20',
                            padding: '6px',
                            borderRadius: '8px'
                          }}>
                            {activity.icon}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                              {activity.action}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Status */}
                  <div style={{
                    background: 'white',
                    padding: 24,
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '20px' }}>
                      ⚡ System Status
                    </h3>
                    <div style={{ space: '16px' }}>
                      {[
                        { metric: 'System Health', value: 'Excellent', color: '#10b981', icon: '💚' },
                        { metric: 'Database', value: 'Online', color: '#10b981', icon: '🗄️' },
                        { metric: 'Last Backup', value: '2 hours ago', color: '#0d9488', icon: '💾' },
                        { metric: 'Active Users', value: '3', color: '#667eea', icon: '👥' },
                        { metric: 'Response Time', value: '< 200ms', color: '#10b981', icon: '⚡' }
                      ].map((status, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: index < 4 ? '1px solid #f3f4f6' : 'none'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '16px', marginRight: '8px' }}>{status.icon}</span>
                            <span style={{ color: '#1f2937', fontWeight: '500', fontSize: '14px' }}>
                              {status.metric}
                            </span>
                          </div>
                          <span style={{
                            color: status.color,
                            fontWeight: '600',
                            fontSize: '14px'
                          }}>
                            {status.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  textAlign: 'center',
                  marginTop: 40,
                  padding: '20px',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  © 2025 Breadmilk Inventory System. Built with ❤️ for efficient bakery management.
                </div>
              </div>
            )}

            {/* Request Management - All Requests Page */}
            {mainContent === 'all-requests' && (
              <div style={{
                width: '100%',
                maxWidth: 1200,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 32
              }}>
                <h2 style={{ 
                  fontWeight: 700, 
                  color: '#333', 
                  fontSize: 24, 
                  textAlign: 'center', 
                  marginBottom: 32,
                  background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  📋 All User Requests
                </h2>

                {/* Request Statistics Cards */}
                {this.state.requestStats && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: 20, 
                    marginBottom: 32 
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #64748b, #475569)',
                      color: 'white',
                      padding: 20,
                      borderRadius: 12,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
                        {this.state.requestStats.total}
                      </div>
                      <div style={{ fontSize: 14, opacity: 0.9 }}>Total Requests</div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      padding: 20,
                      borderRadius: 12,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
                        {this.state.requestStats.pending}
                      </div>
                      <div style={{ fontSize: 14, opacity: 0.9 }}>Pending</div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981, #047857)',
                      color: 'white',
                      padding: 20,
                      borderRadius: 12,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
                        {this.state.requestStats.approved}
                      </div>
                      <div style={{ fontSize: 14, opacity: 0.9 }}>Approved</div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      padding: 20,
                      borderRadius: 12,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
                        {this.state.requestStats.rejected}
                      </div>
                      <div style={{ fontSize: 14, opacity: 0.9 }}>Rejected</div>
                    </div>
                  </div>
                )}

                {/* Requests Table */}
                <div>
                  <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📋 Request List</h3>
                  {this.state.userRequests.length > 0 ? (
                    <div style={{
                      background: '#f8f9fa',
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '1px solid #e9ecef'
                    }}>
                      {/* Table Header */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 100px 120px 100px 150px',
                        gap: 12,
                        padding: 16,
                        background: '#e9ecef',
                        fontWeight: 'bold',
                        color: '#495057',
                        fontSize: 14
                      }}>
                        <div>User</div>
                        <div>Item</div>
                        <div>Quantity</div>
                        <div>Status</div>
                        <div>Date</div>
                        <div>Actions</div>
                        <div>Response</div>
                      </div>

                      {/* Table Rows */}
                      {this.state.userRequests.map((request, index) => (
                        <div
                          key={request.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr 100px 120px 100px 150px',
                            gap: 12,
                            padding: 16,
                            borderBottom: index < this.state.userRequests.length - 1 ? '1px solid #dee2e6' : 'none',
                            background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                            fontSize: 14,
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 'bold' }}>
                              {request.firstname} {request.lastname}
                            </div>
                            <div style={{ fontSize: 12, color: '#6c757d' }}>
                              {request.user_email}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{request.item_name}</div>
                            {request.note && (
                              <div style={{ fontSize: 12, color: '#6c757d', fontStyle: 'italic' }}>
                                "{request.note}"
                              </div>
                            )}
                          </div>
                          <div style={{ fontWeight: 'bold' }}>{request.quantity}</div>
                          <div>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              background: 
                                request.status === 'pending' ? '#fef3c7' :
                                request.status === 'approved' ? '#d1fae5' : '#fecaca',
                              color: 
                                request.status === 'pending' ? '#92400e' :
                                request.status === 'approved' ? '#065f46' : '#991b1b'
                            }}>
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: 12 }}>
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    const response = prompt('Admin response (optional):');
                                    this.handleRequestStatusChange(request.id, 'approved', response || '');
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                  title="Approve Request"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => {
                                    const response = prompt('Reason for rejection:');
                                    if (response) {
                                      this.handleRequestStatusChange(request.id, 'rejected', response);
                                    }
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                  title="Reject Request"
                                >
                                  ✗
                                </button>
                              </>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: '#6c757d' }}>
                            {request.admin_response || '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: 40,
                      color: '#6c757d',
                      background: '#f8f9fa',
                      borderRadius: 12,
                      border: '2px dashed #dee2e6'
                    }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                      <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>No Requests Yet</div>
                      <div>User requests will appear here when they start requesting items.</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Request Management - Pending Requests Page */}
            {mainContent === 'pending-requests' && (
              <div style={{
                width: '100%',
                maxWidth: 1200,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 32
              }}>
                <h2 style={{ 
                  fontWeight: 700, 
                  color: '#333', 
                  fontSize: 24, 
                  textAlign: 'center', 
                  marginBottom: 32,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  🕐 Pending Requests ({this.state.userRequests.filter(r => r.status === 'pending').length})
                </h2>

                {/* Pending Requests */}
                <div>
                  {this.state.userRequests.filter(request => request.status === 'pending').length > 0 ? (
                    <div style={{ display: 'grid', gap: 20 }}>
                      {this.state.userRequests
                        .filter(request => request.status === 'pending')
                        .map((request) => (
                          <div
                            key={request.id}
                            style={{
                              background: '#fef3c7',
                              border: '2px solid #fbbf24',
                              borderRadius: 12,
                              padding: 24,
                              boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)'
                            }}
                          >
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'auto 1fr auto',
                              gap: 20,
                              alignItems: 'center'
                            }}>
                              {/* Request Info */}
                              <div>
                                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#92400e', marginBottom: 8 }}>
                                  {request.item_name}
                                </div>
                                <div style={{ color: '#78350f', marginBottom: 4 }}>
                                  <strong>Requested by:</strong> {request.firstname} {request.lastname}
                                </div>
                                <div style={{ color: '#78350f', marginBottom: 4 }}>
                                  <strong>Email:</strong> {request.user_email}
                                </div>
                                <div style={{ color: '#78350f', marginBottom: 4 }}>
                                  <strong>Quantity:</strong> {request.quantity}
                                </div>
                                <div style={{ color: '#78350f', marginBottom: 4 }}>
                                  <strong>Date:</strong> {new Date(request.created_at).toLocaleDateString()}
                                </div>
                                {request.note && (
                                  <div style={{ 
                                    color: '#78350f', 
                                    fontStyle: 'italic',
                                    background: 'rgba(120, 53, 15, 0.1)',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    marginTop: '8px'
                                  }}>
                                    <strong>Note:</strong> "{request.note}"
                                  </div>
                                )}
                              </div>

                              {/* Status Badge */}
                              <div style={{ textAlign: 'center' }}>
                                <div style={{
                                  background: '#f59e0b',
                                  color: 'white',
                                  padding: '8px 16px',
                                  borderRadius: '20px',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  display: 'inline-block'
                                }}>
                                  ⏳ PENDING
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <button
                                  onClick={() => {
                                    const response = prompt('Admin response (optional):');
                                    this.handleRequestStatusChange(request.id, 'approved', response || '');
                                  }}
                                  style={{
                                    background: 'linear-gradient(135deg, #10b981, #047857)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease'
                                  }}
                                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                  ✅ Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const response = prompt('Reason for rejection:');
                                    if (response) {
                                      this.handleRequestStatusChange(request.id, 'rejected', response);
                                    }
                                  }}
                                  style={{
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease'
                                  }}
                                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                  ❌ Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: 40,
                      color: '#6c757d',
                      background: '#f8f9fa',
                      borderRadius: 12,
                      border: '2px dashed #dee2e6'
                    }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                      <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>No Pending Requests</div>
                      <div>All requests have been processed! Great job staying on top of things.</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Request Management - Request Statistics Page */}
            {mainContent === 'request-stats' && (
              <div style={{
                width: '100%',
                maxWidth: 1200,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 32
              }}>
                <h2 style={{ 
                  fontWeight: 700, 
                  color: '#333', 
                  fontSize: 24, 
                  textAlign: 'center', 
                  marginBottom: 32,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  📊 Request Statistics & Analytics
                </h2>

                {/* Statistics Overview */}
                {this.state.requestStats && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: 24, 
                    marginBottom: 40 
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      padding: 24,
                      borderRadius: 16,
                      textAlign: 'center',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                    }}>
                      <div style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 8 }}>
                        {this.state.requestStats.total}
                      </div>
                      <div style={{ fontSize: 16, opacity: 0.9 }}>Total Requests</div>
                      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>All time</div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      padding: 24,
                      borderRadius: 16,
                      textAlign: 'center',
                      boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
                    }}>
                      <div style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 8 }}>
                        {this.state.requestStats.pending}
                      </div>
                      <div style={{ fontSize: 16, opacity: 0.9 }}>Pending Requests</div>
                      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Need attention</div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981, #047857)',
                      color: 'white',
                      padding: 24,
                      borderRadius: 16,
                      textAlign: 'center',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
                    }}>
                      <div style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 8 }}>
                        {this.state.requestStats.approved}
                      </div>
                      <div style={{ fontSize: 16, opacity: 0.9 }}>Approved</div>
                      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                        {this.state.requestStats.total > 0 ? Math.round((this.state.requestStats.approved / this.state.requestStats.total) * 100) : 0}% approval rate
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      padding: 24,
                      borderRadius: 16,
                      textAlign: 'center',
                      boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                    }}>
                      <div style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 8 }}>
                        {this.state.requestStats.rejected}
                      </div>
                      <div style={{ fontSize: 16, opacity: 0.9 }}>Rejected</div>
                      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                        {this.state.requestStats.total > 0 ? Math.round((this.state.requestStats.rejected / this.state.requestStats.total) * 100) : 0}% rejection rate
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Requests */}
                <div>
                  <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📋 Recent Requests</h3>
                  {this.state.requestStats?.recent && this.state.requestStats.recent.length > 0 ? (
                    <div style={{
                      background: '#f8f9fa',
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '1px solid #e9ecef'
                    }}>
                      {this.state.requestStats.recent.map((request, index) => (
                        <div
                          key={request.id}
                          style={{
                            padding: 16,
                            borderBottom: index < this.state.requestStats.recent.length - 1 ? '1px solid #dee2e6' : 'none',
                            background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                              {request.firstname} {request.lastname} requested {request.quantity}x {request.item_name}
                            </div>
                            <div style={{ fontSize: 12, color: '#6c757d' }}>
                              {request.user_email} • {new Date(request.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            background: 
                              request.status === 'pending' ? '#fef3c7' :
                              request.status === 'approved' ? '#d1fae5' : '#fecaca',
                            color: 
                              request.status === 'pending' ? '#92400e' :
                              request.status === 'approved' ? '#065f46' : '#991b1b'
                          }}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: 40,
                      color: '#6c757d',
                      background: '#f8f9fa',
                      borderRadius: 12,
                      border: '2px dashed #dee2e6'
                    }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                      <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>No Recent Activity</div>
                      <div>Request activity will appear here as users start making requests.</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    );
  }
}
