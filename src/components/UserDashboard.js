  // UserDashboard.js - Reborn Version 2.0
// Modern Breadmilk Inventory Management System

import React, { Component } from 'react';
import './UserDashboard.css';
import ChevronDown from './ChevronDown';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import DemandForecasting from './DemandForecasting';
import SeasonalPredictions from './SeasonalPredictions';
import SmartRestocking from './SmartRestocking';

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
      dashboardSalesPeriod: 'today',
      openDropdown: null,
      mainContent: 'dashboard', // Set default main content to dashboard homepage
      inventoryItems: [], // Add inventory items state
      loading: true,
      criticalItems: [],
      showCriticalAlert: false,
      lowStockThreshold: 10, // Changed from 50 to 10 to match your data
      salesSummary: null,
      error: null,
      smartRestockingData: [], // New state for SmartRestocking
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
      stockAddInputs: {},
      stockAdjustInputs: {},
      stockAdjustLoading: {},
      quickSaleInputs: {},
      selectedAllItemsItemId: null,
      showAllItemsActionPanel: false,
      returnToAllItemsAfterUpdate: false,
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
      requestFilter: 'all', // all, pending, approved, rejected
      liveTransactionEvents: [],
      liveFeedNow: Date.now(),
      topSearchQuery: '',
      showAlertsPanel: false,
      toast: {
        visible: false,
        message: '',
        type: 'success'
      }
    };
    this.toastTimer = null;
    this.liveFeedTimer = null;

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
    this.getSuggestedCategory = this.getSuggestedCategory.bind(this);
    this.applySuggestedCategory = this.applySuggestedCategory.bind(this);
    // Categories methods
    this.handleAddCategory = this.handleAddCategory.bind(this);
    this.handleUpdateCategory = this.handleUpdateCategory.bind(this);
    this.handleDeleteCategory = this.handleDeleteCategory.bind(this);
    // Update Items methods
    this.handleUpdateItemSelect = this.handleUpdateItemSelect.bind(this);
    this.handleUpdateItemChange = this.handleUpdateItemChange.bind(this);
    this.saveItemUpdate = this.saveItemUpdate.bind(this);
    this.openItemUpdateFromAllItems = this.openItemUpdateFromAllItems.bind(this);
    this.handleDeleteInventoryItem = this.handleDeleteInventoryItem.bind(this);
    this.applyQuantityShortcut = this.applyQuantityShortcut.bind(this);
    this.handleStockAddInputChange = this.handleStockAddInputChange.bind(this);
    this.applyCriticalStockAdd = this.applyCriticalStockAdd.bind(this);
    this.handleStockAdjustInputChange = this.handleStockAdjustInputChange.bind(this);
    this.handleAdjustStock = this.handleAdjustStock.bind(this);
    this.handleQuickSaleInputChange = this.handleQuickSaleInputChange.bind(this);
    this.handleQuickSale = this.handleQuickSale.bind(this);
    this.handleAllItemsRowSelect = this.handleAllItemsRowSelect.bind(this);
    this.closeAllItemsActionPanel = this.closeAllItemsActionPanel.bind(this);
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

    this.liveFeedTimer = setInterval(() => {
      this.setState({ liveFeedNow: Date.now() });
      this.fetchSalesData();
      this.fetchInventoryItems();
    }, 20000);
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.checkLogin);
    window.removeEventListener('focus', this.checkLogin);
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    if (this.liveFeedTimer) {
      clearInterval(this.liveFeedTimer);
    }
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
  getSuggestedCategory(itemName) {
    const input = (itemName || '').toLowerCase().trim();
    if (!input) {
      return '';
    }

    const rules = [
      { category: 'Dairy', keywords: ['milk', 'cheese', 'yogurt', 'butter', 'cream'] },
      { category: 'Personal Care', keywords: ['shampoo', 'soap', 'conditioner', 'toothpaste', 'lotion'] },
      { category: 'Beverages', keywords: ['juice', 'soda', 'coffee', 'tea', 'water'] },
      { category: 'Bakery', keywords: ['bread', 'bun', 'cake', 'croissant', 'pastry'] },
      { category: 'Snacks', keywords: ['chips', 'cracker', 'cookie', 'biscuit'] }
    ];

    const match = rules.find((rule) => rule.keywords.some((keyword) => input.includes(keyword)));
    return match ? match.category : '';
  }

  applySuggestedCategory(index) {
    const row = this.state.addItemsRows[index];
    const suggestedCategory = this.getSuggestedCategory(row?.itemName);

    if (!suggestedCategory) {
      return;
    }

    this.handleAddItemsChange(index, 'category', suggestedCategory);
  }

  handleAddItemsChange(index, field, value) {
    let nextValue = value;

    if (field === 'quantity') {
      if (value === '') {
        nextValue = '';
      } else {
        const parsed = parseInt(value, 10);
        if (Number.isNaN(parsed)) {
          return;
        }
        nextValue = String(Math.max(1, parsed));
      }
    }

    if (field === 'price') {
      if (value === '') {
        nextValue = '';
      } else if (/^\d*\.?\d*$/.test(value)) {
        const parsed = parseFloat(value);
        nextValue = Number.isNaN(parsed) ? '' : String(Math.max(0, parsed));
      } else {
        return;
      }
    }

    const updatedRows = this.state.addItemsRows.map((row, i) =>
      i === index ? { ...row, [field]: nextValue } : row
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

    const invalidRows = validRows.filter(row => {
      const quantityValue = parseInt(row.quantity, 10);
      const priceValue = parseFloat(row.price);
      return Number.isNaN(quantityValue) || quantityValue < 1 || Number.isNaN(priceValue) || priceValue < 0;
    });

    if (invalidRows.length > 0) {
      alert('Please fix validation errors: quantity must be at least 1 and price must be at least 0.');
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
      this.showToast('Please select an item to update', 'error');
      return;
    }

    if (!updateItemName || !updateItemQuantity || !updateItemPrice || !updateItemCategory) {
      this.showToast('Please fill all fields', 'error');
      return;
    }

    try {
      // Use multiple ID field checks to ensure compatibility
      const itemId = selectedUpdateItem.item_id || selectedUpdateItem.id;
      
      if (!itemId) {
        this.showToast('Error: Item ID not found', 'error');
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
        this.showToast('Item updated successfully');
        this.setState({
          mainContent: 'all-items-table',
          selectedUpdateItem: null,
          updateItemName: '',
          updateItemQuantity: '',
          updateItemPrice: '',
          updateItemCategory: '',
          selectedAllItemsItemId: null,
          showAllItemsActionPanel: false,
          returnToAllItemsAfterUpdate: false
        });
        await this.fetchInventoryItems(); // Refresh the items list
      } else {
        const errorMessage = result.message || result.error || 'Failed to update item';
        console.error('Update failed:', errorMessage);
        this.showToast(`Error: ${errorMessage}`, 'error');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      this.showToast('Network error: ' + error.message, 'error');
    }
  }

  openItemUpdateFromAllItems(item) {
    this.setState({
      mainContent: 'update-items',
      selectedUpdateItem: {
        id: item.item_id || item.id,
        name: item.item_name || item.name,
        quantity: item.quantity,
        price: item.price || 0,
        category: item.category,
        updated_at: item.updated_at || null
      },
      updateItemName: item.item_name || item.name || '',
      updateItemQuantity: (item.quantity ?? 0).toString(),
      updateItemPrice: (item.price ?? 0).toString(),
      updateItemCategory: item.category || '',
      returnToAllItemsAfterUpdate: true
    });
  }

  handleAllItemsRowSelect(item) {
    const itemId = item.item_id || item.id;
    if (!itemId) {
      return;
    }

    this.setState({
      selectedAllItemsItemId: itemId,
      showAllItemsActionPanel: true
    });
  }

  closeAllItemsActionPanel() {
    this.setState({
      showAllItemsActionPanel: false,
      selectedAllItemsItemId: null
    });
  }

  async handleDeleteInventoryItem(item) {
    const itemId = item.item_id || item.id;
    const itemName = item.item_name || item.name || 'this item';

    if (!itemId) {
      this.showToast('Error: Item ID not found', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/inventory/items/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const errorMessage = result.message || result.error || 'Failed to delete item';
        this.showToast(`Error: ${errorMessage}`, 'error');
        return;
      }

      // Immediate UI feedback + refresh from server for consistency
      this.setState((prevState) => ({
        inventoryItems: prevState.inventoryItems.filter((i) => (i.item_id || i.id) !== itemId),
        selectedAllItemsItemId: prevState.selectedAllItemsItemId === itemId ? null : prevState.selectedAllItemsItemId,
        showAllItemsActionPanel: prevState.selectedAllItemsItemId === itemId ? false : prevState.showAllItemsActionPanel
      }));

      await this.fetchInventoryItems();
      await this.fetchCriticalItems();
      this.showToast(`"${itemName}" deleted successfully.`);
    } catch (error) {
      this.showToast('Error deleting item: ' + error.message, 'error');
    }
  }

  async applyQuantityShortcut(item, incrementValue = 15) {
    try {
      const itemId = item.item_id || item.id;
      if (!itemId) {
        alert('Error: Item ID not found');
        return false;
      }

      const currentQuantity = parseFloat(item.quantity) || 0;
      const updatedQuantity = currentQuantity + incrementValue;

      const response = await fetch(`http://localhost:5001/api/inventory/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item_name: item.item_name || item.name || '',
          quantity: updatedQuantity,
          price: parseFloat(item.price) || 0,
          category: item.category || 'Uncategorized'
        })
      });

      const result = await response.json();
      if (response.ok && result.success !== false) {
        await this.fetchInventoryItems();
        await this.fetchCriticalItems();
        this.logTransactionEvent({
          transactionType: 'Restock',
          productName: item.item_name || item.name || 'Item',
          quantity: incrementValue
        });
        return true;
      } else {
        const errorMessage = result.message || result.error || 'Failed to update quantity';
        alert(`❌ Error: ${errorMessage}`);
        return false;
      }
    } catch (error) {
      alert('❌ Network error: ' + error.message);
      return false;
    }
  }

  handleStockAddInputChange(itemId, value) {
    this.setState((prevState) => ({
      stockAddInputs: {
        ...prevState.stockAddInputs,
        [itemId]: value
      }
    }));
  }

  async applyCriticalStockAdd(item) {
    const itemId = item.item_id || item.id;
    const rawInput = this.state.stockAddInputs[itemId];
    const parsed = parseInt(rawInput, 10);
    const incrementValue = Number.isFinite(parsed) && parsed > 0 ? parsed : 19;

    const isSuccess = await this.applyQuantityShortcut(item, incrementValue);
    if (isSuccess) {
      this.setState((prevState) => ({
        stockAddInputs: {
          ...prevState.stockAddInputs,
          [itemId]: '19'
        }
      }));
    }
  }

  handleStockAdjustInputChange(itemId, value) {
    this.setState((prevState) => ({
      stockAdjustInputs: {
        ...prevState.stockAdjustInputs,
        [itemId]: value
      }
    }));
  }

  async handleAdjustStock(item, operation) {
    const itemId = item.item_id || item.id;
    const itemName = item.item_name || item.name || 'Item';
    const rawAmount = this.state.stockAdjustInputs[itemId];
    const amount = parseInt(rawAmount, 10);

    if (!itemId) {
      this.showToast('Error: Item ID not found', 'error');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      this.showToast('Please enter a valid stock amount', 'error');
      return;
    }

    const currentQty = parseInt(item.quantity, 10) || 0;
    const nextQty = operation === 'add' ? currentQty + amount : currentQty - amount;
    if (operation === 'subtract' && nextQty < 0) {
      this.showToast(`Cannot subtract ${amount}. Only ${currentQty} in stock.`, 'error');
      return;
    }

    this.setState((prevState) => ({
      stockAdjustLoading: {
        ...prevState.stockAdjustLoading,
        [itemId]: true
      }
    }));

    try {
      const response = await fetch(`http://localhost:5001/api/inventory/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: item.item_name || item.name || '',
          quantity: nextQty,
          price: parseFloat(item.price) || 0,
          category: item.category || 'Uncategorized'
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        this.showToast(result.message || 'Failed to adjust stock', 'error');
        return;
      }

      this.showToast(`${itemName} updated: ${currentQty} -> ${nextQty}`, 'success');
      this.logTransactionEvent({
        transactionType: operation === 'add' ? 'Restock' : 'Sale',
        productName: itemName,
        quantity: amount
      });

      await this.fetchInventoryItems();
      await this.fetchCriticalItems();

      this.setState((prevState) => ({
        stockAdjustInputs: {
          ...prevState.stockAdjustInputs,
          [itemId]: ''
        }
      }));
    } catch (error) {
      this.showToast('Error adjusting stock: ' + error.message, 'error');
    } finally {
      this.setState((prevState) => ({
        stockAdjustLoading: {
          ...prevState.stockAdjustLoading,
          [itemId]: false
        }
      }));
    }
  }

  handleQuickSaleInputChange(itemId, value) {
    this.setState(prevState => ({
      quickSaleInputs: {
        ...prevState.quickSaleInputs,
        [itemId]: value
      }
    }));
  }

  async handleQuickSale(item) {
    const itemId = item.item_id || item.id;
    const quantity = parseInt(this.state.quickSaleInputs[itemId]);

    if (isNaN(quantity) || quantity <= 0) {
      this.showToast('Please enter a valid quantity to sell', 'error');
      return;
    }

    if (quantity > item.quantity) {
      this.showToast(`Not enough stock! Only ${item.quantity} available.`, 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          quantity_sold: quantity
        })
      });

      const result = await response.json();
      if (response.ok) {
        this.showToast(`Sold ${quantity} x ${item.name} successfully!`, 'success');
        this.fetchInventoryItems();
        this.fetchCriticalItems();
        this.fetchSalesSummary();
        this.fetchDailySales();
        // Clear input
        this.handleQuickSaleInputChange(itemId, '');
      } else {
        this.showToast(result.message || 'Failed to record sale', 'error');
      }
    } catch (error) {
      console.error('Error recording quick sale:', error);
      this.showToast('Error connecting to server', 'error');
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
    // Keep access to state in case future iterations use real series data
    // (currently the chart uses simulated-but-realistic patterns).
    
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
    const { inventoryItems } = this.state;
    
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
    const { inventoryItems } = this.state;
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

  /**
   * Data Predictions: derives patterns from real sales + inventory (no ML backend).
   */
  buildDataPredictions() {
    const { salesData = [], inventoryItems = [], lowStockThreshold = 10 } = this.state;
    const dayMs = 86400000;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayStart = now.getTime();

    const parseSaleDate = (sale) => {
      const raw = sale.sale_date || sale.formatted_date || sale.created_at;
      if (!raw) return null;
      const d = new Date(raw);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const dayStartTs = (d) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x.getTime();
    };

    const normalizeName = (n) => String(n || '').trim().toLowerCase();

    const saleKey = (sale) => {
      const id = sale.item_id ?? sale.itemId ?? sale.itemID;
      if (id != null && String(id).trim() !== '') {
        const n = Number(id);
        if (!Number.isNaN(n)) return `id:${n}`;
      }
      return `name:${normalizeName(sale.item_name || sale.name)}`;
    };

    const invKey = (item) => {
      const id = item.item_id ?? item.id ?? item.itemID;
      if (id != null && String(id).trim() !== '') {
        const n = Number(id);
        if (!Number.isNaN(n)) return `id:${n}`;
      }
      return `name:${normalizeName(item.item_name || item.name)}`;
    };

    const validSales = (salesData || [])
      .map((s) => ({ raw: s, d: parseSaleDate(s) }))
      .filter((x) => x.d !== null)
      .sort((a, b) => a.d - b.d);

    const byKey = {};
    const dailyAll = {};

    for (const { raw: s, d } of validSales) {
      const k = saleKey(s);
      const dayTs = dayStartTs(d);
      const qty = parseInt(s.quantity_sold, 10) || 0;
      const rev = parseFloat(s.total_amount) || 0;

      if (!byKey[k]) {
        byKey[k] = {
          label: s.item_name || s.name || 'Unknown',
          totalQty: 0,
          totalRev: 0,
          txCount: 0,
          byDayMs: {}
        };
      }
      const st = byKey[k];
      st.totalQty += qty;
      st.totalRev += rev;
      st.txCount += 1;
      const dk = String(dayTs);
      st.byDayMs[dk] = (st.byDayMs[dk] || 0) + qty;

      const iso = new Date(dayTs).toISOString().split('T')[0];
      if (!dailyAll[iso]) dailyAll[iso] = { revenue: 0, units: 0 };
      dailyAll[iso].revenue += rev;
      dailyAll[iso].units += qty;
    }

    const sumQtyWindow = (byDayMs, startTs, endTs) => {
      let sum = 0;
      Object.keys(byDayMs).forEach((msStr) => {
        const t = Number(msStr);
        if (t >= startTs && t <= endTs) sum += byDayMs[t];
      });
      return sum;
    };

    const recentStart = todayStart - 13 * dayMs;
    const recentEnd = todayStart;
    const priorStart = todayStart - 27 * dayMs;
    const priorEnd = todayStart - 14 * dayMs;
    const last7Start = todayStart - 6 * dayMs;
    const prev7Start = todayStart - 13 * dayMs;
    const prev7End = todayStart - 7 * dayMs;

    const rows = (inventoryItems || []).map((item) => {
      const ik = invKey(item);
      const st = byKey[ik] || {
        label: item.item_name || item.name || 'Item',
        totalQty: 0,
        totalRev: 0,
        txCount: 0,
        byDayMs: {}
      };

      const stock = parseInt(item.quantity, 10) || 0;
      const price = parseFloat(item.price) || 0;
      const name = item.item_name || item.name || st.label || 'Item';
      const category = item.category || '—';

      const recentQty = sumQtyWindow(st.byDayMs, recentStart, recentEnd);
      const priorQty = sumQtyWindow(st.byDayMs, priorStart, priorEnd);

      const recentAvgDaily = recentQty / 14;
      const priorAvgDaily = priorQty / 14;

      let trendPct = 0;
      if (priorAvgDaily <= 1e-6) {
        trendPct = recentAvgDaily > 1e-6 ? 100 : 0;
      } else {
        trendPct = Math.round(((recentAvgDaily - priorAvgDaily) / priorAvgDaily) * 100);
      }

      let daysCover = null;
      if (recentAvgDaily > 1e-6) daysCover = stock / recentAvgDaily;

      let shortageRisk = null;
      if (stock === 0 && recentAvgDaily > 0.05) shortageRisk = 'critical';
      else if (daysCover !== null && daysCover < 5 && recentAvgDaily > 1e-6) shortageRisk = 'high';
      else if (daysCover !== null && daysCover < 10 && recentAvgDaily > 1e-6) shortageRisk = 'medium';
      else if (stock <= lowStockThreshold && recentAvgDaily > 1e-6) shortageRisk = 'medium';

      const targetCoverDays = 14;
      let suggestedReorder = 0;
      if (recentAvgDaily > 1e-6) {
        suggestedReorder = Math.max(0, Math.ceil(recentAvgDaily * targetCoverDays - stock));
      } else if (stock <= lowStockThreshold && stock >= 0) {
        suggestedReorder = Math.max(0, Math.ceil(lowStockThreshold * 2 - stock));
      }

      const avgUnitPriceFromSales =
        st.totalQty > 0 ? st.totalRev / st.totalQty : price || 0;

      return {
        id: item.item_id ?? item.id,
        name,
        category,
        stock,
        price,
        recentQty,
        priorQty,
        recentAvgDaily,
        trendPct,
        daysCover,
        shortageRisk,
        suggestedReorder,
        totalSoldAllTime: st.totalQty,
        avgUnitPriceFromSales,
      };
    });

    const fastSelling = [...rows].filter((r) => r.recentQty > 0).sort((a, b) => b.recentQty - a.recentQty).slice(0, 10);

    const slowMoving = [...rows].filter((r) => r.stock > lowStockThreshold && r.recentQty === 0 && r.stock > 0)
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10);

    const increasingDemand = [...rows].filter((r) => r.trendPct >= 15 && r.recentQty >= 3)
      .sort((a, b) => b.trendPct - a.trendPct)
      .slice(0, 10);

    const scoreRestock = (r) => {
      let score = 0;
      if (r.shortageRisk === 'critical') score += 100;
      else if (r.shortageRisk === 'high') score += 70;
      else if (r.shortageRisk === 'medium') score += 40;
      score += Math.min(40, Math.round(r.recentAvgDaily * 10));
      score += Math.min(25, Math.max(0, 100 - (r.daysCover != null ? r.daysCover : 999) * 3));
      return score;
    };

    const restockPriority = [...rows]
      .filter((r) => r.shortageRisk && r.suggestedReorder > 0)
      .sort((a, b) => scoreRestock(b) - scoreRestock(a))
      .slice(0, 12);

    const atRiskCount = rows.filter((r) => r.shortageRisk === 'critical' || r.shortageRisk === 'high').length;

    const dailyIsoKeys = Object.keys(dailyAll).sort();
    const lastIso = dailyIsoKeys.length ? dailyIsoKeys[dailyIsoKeys.length - 1] : new Date(todayStart).toISOString().split('T')[0];
    const lastDate = new Date(`${lastIso}T00:00:00`);

    const dailyTrend = [];
    for (let i = 27; i >= 0; i--) {
      const dd = new Date(lastDate);
      dd.setDate(dd.getDate() - i);
      const iso = dd.toISOString().split('T')[0];
      const entry = dailyAll[iso] || { revenue: 0, units: 0 };
      dailyTrend.push({
        date: dd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenue: Number(entry.revenue.toFixed(2)),
        units: entry.units,
      });
    }

    const sumDailyRange = (startTs, endTs) => {
      let rev = 0;
      let units = 0;
      const cur = new Date(startTs);
      const end = new Date(endTs);
      while (cur <= end) {
        const iso = cur.toISOString().split('T')[0];
        if (dailyAll[iso]) {
          rev += dailyAll[iso].revenue;
          units += dailyAll[iso].units;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return { rev, units };
    };

    const last7 = sumDailyRange(last7Start, recentEnd);
    const prev7 = sumDailyRange(prev7Start, prev7End);

    const last7AvgDailyRev = last7.rev / 7;
    const prev7AvgDailyRev = prev7.rev / 7;
    let revTrendPct = 0;
    if (prev7AvgDailyRev <= 1e-6) revTrendPct = last7AvgDailyRev > 1e-6 ? 100 : 0;
    else revTrendPct = Math.round(((last7AvgDailyRev - prev7AvgDailyRev) / prev7AvgDailyRev) * 100);

    const growthFactor = 1 + Math.min(0.25, Math.max(-0.2, revTrendPct / 200));
    const projectedNext7Revenue = Number((last7AvgDailyRev * 7 * growthFactor).toFixed(2));
    const projectedNext7Units = Math.max(0, Math.round((last7.units / 7) * 7 * growthFactor));

    const insightBullets = [];
    if (validSales.length === 0) {
      insightBullets.push('No dated sales records were found. When you record sales with dates, this view will show velocity, trends, and shortage risk per product.');
    } else {
      insightBullets.push(
        `Analysis uses ${validSales.length} sale line(s) across ${dailyIsoKeys.length} day(s) with activity.`
      );
      if (atRiskCount > 0) {
        insightBullets.push(
          `${atRiskCount} product(s) show elevated shortage risk based on recent sell-through vs on-hand stock. Prioritize restocking or reducing promotions on thin coverage items.`
        );
      } else {
        insightBullets.push('No critical sell-through shortages detected in the last 14 days for matched inventory items.');
      }
      const topFast = fastSelling[0];
      if (topFast) {
        insightBullets.push(
          `Fast mover: "${topFast.name}" sold ${topFast.recentQty} unit(s) in the last 14 days — monitor coverage and reorder lead time ahead of spikes.`
        );
      }
      const topInc = increasingDemand[0];
      if (topInc) {
        insightBullets.push(
          `Rising demand: "${topInc.name}" is up about ${topInc.trendPct}% in daily run-rate vs the prior 14 days — prepare stock before uplift turns into outages.`
        );
      }
      const topSlow = slowMoving[0];
      if (topSlow) {
        insightBullets.push(
          `"${topSlow.name}" has steady on-hand (${topSlow.stock}) but zero sales in the last 14 days — consider promotions, bundles, or reduced purchasing to limit overstock.`
        );
      }
      insightBullets.push(
        `Next-week revenue outlook ( heuristic ): about ₱${projectedNext7Revenue.toLocaleString()} based on last week’s average with a small trend adjustment (${revTrendPct >= 0 ? '+' : ''}${revTrendPct}% vs prior week).`
      );
    }

    return {
      validSalesCount: validSales.length,
      atRiskCount,
      fastSelling,
      slowMoving,
      increasingDemand,
      restockPriority,
      dailyTrend,
      summary: {
        last7Revenue: Number(last7.rev.toFixed(2)),
        prev7Revenue: Number(prev7.rev.toFixed(2)),
        last7Units: last7.units,
        revTrendPct,
        projectedNext7Revenue,
        projectedNext7Units,
      },
      insightBullets,
    };
  }

  showToast = (message, type = 'success') => {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.setState({
      toast: {
        visible: true,
        message,
        type
      }
    });

    this.toastTimer = setTimeout(() => {
      this.setState((prevState) => ({
        toast: {
          ...prevState.toast,
          visible: false
        }
      }));
    }, 2600);
  };

  logTransactionEvent = ({ transactionType, productName, quantity }) => {
    const event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      transactionType,
      productName,
      quantity: parseInt(quantity, 10) || 0,
      timestamp: new Date().toISOString()
    };

    this.setState((prevState) => ({
      liveTransactionEvents: [event, ...(prevState.liveTransactionEvents || [])].slice(0, 50),
      liveFeedNow: Date.now()
    }));
  };

  getRelativeTimeLabel = (value) => {
    const dateValue = new Date(value);
    if (Number.isNaN(dateValue.getTime())) {
      return 'just now';
    }

    const diffSeconds = Math.max(1, Math.floor((Date.now() - dateValue.getTime()) / 1000));
    if (diffSeconds < 10) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  render() {
    const { 
      loading, 
      openDropdown, 
      mainContent,
      userInfo,
      selectedSaleItem,
      saleQuantity,
      dailySales,
      salesSummary,
      criticalItems,
      showCriticalAlert,
      toast
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

    const HEADER_HEIGHT = 70;
    const LAYOUT_TOP_OFFSET = HEADER_HEIGHT;
    const selectedAllItemsItem = this.state.inventoryItems.find(
      (item) => (item.item_id || item.id) === this.state.selectedAllItemsItemId
    );
    const totalProducts = this.state.inventoryItems.length;
    const totalStockQuantity = this.state.inventoryItems.reduce(
      (sum, item) => sum + (parseInt(item.quantity, 10) || 0),
      0
    );
    const outOfStockItemsCount = this.state.inventoryItems.filter(
      (item) => (parseInt(item.quantity, 10) || 0) === 0
    ).length;
    const lowStockItemsCount = this.state.inventoryItems.filter((item) => {
      const qty = parseInt(item.quantity, 10) || 0;
      return qty > 0 && qty <= this.state.lowStockThreshold;
    }).length;
    const stockStatusForItem = (item) => {
      const qty = parseInt(item.quantity, 10) || 0;
      if (qty <= 0) {
        return { key: 'critical', label: 'Critical (Out of Stock)', color: '#b91c1c', bg: '#fee2e2' };
      }
      if (qty <= this.state.lowStockThreshold) {
        return { key: 'low', label: 'Low Stock', color: '#c2410c', bg: '#ffedd5' };
      }
      return { key: 'normal', label: 'Normal', color: '#166534', bg: '#dcfce7' };
    };
    const affectedStockItems = this.state.inventoryItems
      .map((item) => ({ ...item, stockStatus: stockStatusForItem(item) }))
      .filter((item) => item.stockStatus.key !== 'normal')
      .sort((a, b) => (parseInt(a.quantity, 10) || 0) - (parseInt(b.quantity, 10) || 0));
    const todayRevenue = parseFloat(
      (salesSummary && salesSummary.today && salesSummary.today.total_revenue) ||
      (dailySales && dailySales.summary && dailySales.summary.total_revenue) ||
      0
    ) || 0;
    const monthRevenue = parseFloat(
      (salesSummary && salesSummary.month && salesSummary.month.total_revenue) || 0
    ) || 0;
    const weekStartDate = new Date();
    weekStartDate.setHours(0, 0, 0, 0);
    weekStartDate.setDate(weekStartDate.getDate() - 6);
    const weekRevenue = (this.state.salesData || []).reduce((sum, sale) => {
      const saleDateRaw = sale.sale_date || sale.formatted_date || sale.created_at;
      if (!saleDateRaw) {
        return sum;
      }
      const parsedSaleDate = new Date(saleDateRaw);
      if (Number.isNaN(parsedSaleDate.getTime())) {
        return sum;
      }
      const normalizedSaleDate = new Date(parsedSaleDate);
      normalizedSaleDate.setHours(0, 0, 0, 0);
      if (normalizedSaleDate < weekStartDate) {
        return sum;
      }
      return sum + (parseFloat(sale.total_amount) || 0);
    }, 0);
    const salesByPeriod = {
      today: todayRevenue,
      week: weekRevenue,
      month: monthRevenue
    };
    const selectedSalesLabel = this.state.dashboardSalesPeriod === 'today'
      ? 'Today'
      : this.state.dashboardSalesPeriod === 'week'
        ? 'This Week'
        : 'This Month';
    const selectedSalesValue = salesByPeriod[this.state.dashboardSalesPeriod] || 0;
    const topSellingMap = (this.state.salesData || []).reduce((acc, sale) => {
      const itemName = sale.item_name || sale.name || 'Unknown';
      const quantity = parseInt(sale.quantity_sold, 10) || 0;
      const revenue = parseFloat(sale.total_amount) || 0;
      if (!acc[itemName]) {
        acc[itemName] = { name: itemName, quantity: 0, revenue: 0 };
      }
      acc[itemName].quantity += quantity;
      acc[itemName].revenue += revenue;
      return acc;
    }, {});
    const topSellingProductsData = Object.values(topSellingMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);
    const categoryMap = this.state.inventoryItems.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += 1;
      return acc;
    }, {});
    const categoryDistributionData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));
    const trendMap = (this.state.salesData || []).reduce((acc, sale) => {
      const saleDateRaw = sale.sale_date || sale.formatted_date || sale.created_at;
      if (!saleDateRaw) {
        return acc;
      }
      const parsed = new Date(saleDateRaw);
      if (Number.isNaN(parsed.getTime())) {
        return acc;
      }
      const key = parsed.toISOString().split('T')[0];
      if (!acc[key]) {
        acc[key] = { revenue: 0, quantity: 0 };
      }
      acc[key].revenue += parseFloat(sale.total_amount) || 0;
      acc[key].quantity += parseInt(sale.quantity_sold, 10) || 0;
      return acc;
    }, {});
    const salesTrendData = Object.entries(trendMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-7)
      .map(([date, values]) => ({
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenue: Number(values.revenue.toFixed(2)),
        quantity: values.quantity
      }));
    const pieColors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316'];
    const baseCardStyle = {
      borderRadius: 14,
      padding: 20
    };
    const searchQuery = (this.state.topSearchQuery || '').trim().toLowerCase();
    const matchesSearch = (value) => String(value || '').toLowerCase().includes(searchQuery);
    const pendingRequestCount = this.state.requestStats?.pending || 0;
    const notificationCount = lowStockItemsCount + outOfStockItemsCount + pendingRequestCount;
    const matchingRequests = (this.state.userRequests || []).filter((request) =>
      !searchQuery || matchesSearch(
        `${request.item_name || ''} ${request.firstname || ''} ${request.lastname || ''} ${request.user_email || ''} ${request.note || ''} ${request.status || ''}`
      )
    );
    const matchingPendingRequestCount = matchingRequests.filter((request) => request.status === 'pending').length;
    const salesFeedEvents = (this.state.salesData || [])
      .map((sale, index) => ({
        id: `sale-${sale.sale_id || sale.id || index}-${sale.sale_date || sale.created_at || index}`,
        transactionType: 'Sale',
        productName: sale.item_name || sale.name || 'Item',
        quantity: parseInt(sale.quantity_sold, 10) || 0,
        timestamp: sale.sale_date || sale.created_at || sale.formatted_date || new Date().toISOString()
      }))
      .filter((event) => event.quantity > 0);
    const allTransactionEvents = [...(this.state.liveTransactionEvents || []), ...salesFeedEvents]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 40);
    const visibleAffectedStockItems = searchQuery
      ? affectedStockItems.filter((item) =>
          matchesSearch(`${item.name || ''} ${item.category || ''} ${item.stockStatus?.label || ''}`)
        )
      : affectedStockItems;
    const visibleTransactionEvents = searchQuery
      ? allTransactionEvents.filter((event) =>
          matchesSearch(`${event.productName || ''} ${event.transactionType || ''}`)
        )
      : allTransactionEvents;
    const visibleTopSellingProductsData = searchQuery
      ? topSellingProductsData.filter((item) => matchesSearch(item.name))
      : topSellingProductsData;
    const visibleCategoryDistributionData = searchQuery
      ? categoryDistributionData.filter((item) => matchesSearch(item.name))
      : categoryDistributionData;
    const categoryTotalCount = (visibleCategoryDistributionData || []).reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const sortedCategoriesForSummary = [...(visibleCategoryDistributionData || [])]
      .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));
    const topCategoriesForSummary = sortedCategoriesForSummary.slice(0, 6);
    const uncategorizedForSummary = sortedCategoriesForSummary.find((item) => String(item.name || '').toLowerCase() === 'uncategorized');
    const fastMovingProducts = visibleTransactionEvents.reduce((acc, event) => {
      if (event.transactionType !== 'Sale') {
        return acc;
      }
      acc[event.productName] = (acc[event.productName] || 0) + event.quantity;
      return acc;
    }, {});
    const topFastMovingProducts = Object.entries(fastMovingProducts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);

    return (
      <div className="dashboard-root" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        margin: 0,
        padding: 0,
        width: '100%',
        overflowX: 'hidden',
        position: 'relative'
      }}>
        {toast?.visible && (
          <div
            style={{
              position: 'fixed',
              top: '84px',
              right: '16px',
              zIndex: 1200,
              background: toast.type === 'error' ? '#dc2626' : '#16a34a',
              color: '#ffffff',
              padding: '10px 14px',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)',
              fontSize: '13px',
              fontWeight: '600',
              maxWidth: '320px'
            }}
          >
            {toast.message}
          </div>
        )}
        {/* Modern Header - Reborn Design */}
        <div className="dashboard-header" style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
          color: '#ffffff',
          padding: '12px 18px',
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxSizing: 'border-box'
        }}>
          {/* Left Section - Brand & Welcome */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '999px',
              padding: '6px 10px'
            }}>
              <div style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#22c55e',
                animation: 'pulse 2s infinite'
              }}></div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>
                Online
              </span>
              <span style={{ fontSize: '12px', color: 'rgba(226, 232, 240, 0.85)' }}>
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Right Section - Quick utilities, user info, actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15, 23, 42, 0.25)',
              border: '1px solid rgba(148, 163, 184, 0.45)',
              borderRadius: '10px',
              padding: '6px 10px',
              minWidth: '240px'
            }}>
              <span style={{ fontSize: '13px', color: '#cbd5e1' }}>🔎</span>
              <input
                type="text"
                placeholder="Search products or requests..."
                value={this.state.topSearchQuery}
                onChange={(e) => this.setState({ topSearchQuery: e.target.value })}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#f8fafc',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              />
            </div>
            <button
              onClick={() => this.setState((prev) => ({ showAlertsPanel: !prev.showAlertsPanel }))}
              style={{
                border: '1px solid rgba(148, 163, 184, 0.4)',
                background: 'rgba(15, 23, 42, 0.3)',
                color: '#f8fafc',
                borderRadius: '10px',
                padding: '8px 10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔔 Alerts {notificationCount > 0 ? `(${notificationCount})` : ''}
            </button>
            <button
              onClick={() => this.setState({ mainContent: 'record-sale' })}
              style={{
                border: '1px solid rgba(45, 212, 191, 0.4)',
                background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              + Quick Sale
            </button>
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
                <span style={{ fontSize: '11px', opacity: 0.85 }}>
                  Admin Online
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
        {this.state.showAlertsPanel && (
          <div style={{
            position: 'fixed',
            top: '76px',
            right: '112px',
            width: '320px',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            boxShadow: '0 16px 30px rgba(15, 23, 42, 0.18)',
            zIndex: 1300,
            padding: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Notifications</span>
              <button
                onClick={() => this.setState({ showAlertsPanel: false })}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                Close
              </button>
            </div>
            <div style={{ display: 'grid', gap: '8px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', color: '#334155' }}>Low Stock Items: <strong>{lowStockItemsCount}</strong></div>
              <div style={{ fontSize: '13px', color: '#334155' }}>Out of Stock Items: <strong>{outOfStockItemsCount}</strong></div>
              <div style={{ fontSize: '13px', color: '#334155' }}>
                Pending Requests: <strong>{searchQuery ? matchingPendingRequestCount : pendingRequestCount}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => this.setState({ showAlertsPanel: false, mainContent: 'critical-items' })}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                View Critical
              </button>
              <button
                onClick={() => this.setState({ showAlertsPanel: false, mainContent: 'pending-requests' })}
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Open Requests
              </button>
              <button
                onClick={() => {
                  this.fetchInventoryItems();
                  this.fetchCriticalItems();
                  this.fetchRequestStats();
                  this.setState({ showAlertsPanel: false });
                }}
                style={{
                  background: '#ecfeff',
                  border: '1px solid #99f6e4',
                  color: '#0f766e',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Main Container - Reborn Design */}
        <div style={{
          marginTop: `${LAYOUT_TOP_OFFSET}px`,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: `calc(100vh - ${LAYOUT_TOP_OFFSET}px)`
        }}>
        <div className="dashboard-container" style={{ display: 'flex', margin: 0, padding: 0 }}>
          <nav className="dashboard-sidebar" style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            color: '#374151',
            padding: '16px 12px',
            borderRadius: '0',
            boxShadow: '4px 0 18px rgba(15, 23, 42, 0.08)',
            width: '264px',
            height: `calc(100vh - ${LAYOUT_TOP_OFFSET}px)`,
            position: 'fixed',
            top: `${LAYOUT_TOP_OFFSET}px`,
            left: '0',
            overflowY: 'auto',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderLeft: 'none',
            zIndex: 5
          }}>
            <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
              <li style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#64748b',
                margin: '0 8px 8px'
              }}>
                MAIN
              </li>
              <li
                onClick={() => this.setState({ mainContent: 'dashboard' })}
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  background: this.state.mainContent === 'dashboard'
                    ? 'linear-gradient(135deg, #0d9488, #14b8a6)'
                    : 'rgba(255,255,255,0.7)',
                  color: this.state.mainContent === 'dashboard' ? '#ffffff' : '#134e4a',
                  marginBottom: '8px',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(13, 148, 136, 0.25)',
                  boxShadow: this.state.mainContent === 'dashboard' ? '0 4px 12px rgba(13, 148, 136, 0.35)' : 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  if (this.state.mainContent !== 'dashboard') {
                    e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                    e.target.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (this.state.mainContent !== 'dashboard') {
                    e.target.style.background = 'rgba(255,255,255,0.7)';
                    e.target.style.transform = 'translateX(0px)';
                  }
                }}
              >
                🏠 Dashboard
              </li>
              {/* Sales Management Dropdown */}
              <li
                className="sidebar-dropdown"
                onClick={() => this.handleDropdownClick('sales')}
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  background: openDropdown === 'sales' ? 
                    'linear-gradient(135deg, #0d9488, #14b8a6)' : 'rgba(255,255,255,0.7)',
                  color: openDropdown === 'sales' ? '#ffffff' : '#134e4a',
                  marginBottom: '8px',
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
              <li style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#64748b',
                margin: '10px 8px 8px'
              }}>
                OPERATIONS
              </li>

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
                    onClick={() => this.setState({ mainContent: 'seasonal-predictions' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'seasonal-predictions' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'seasonal-predictions' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'seasonal-predictions') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'seasonal-predictions') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    🍂 Seasonal Predictions
                  </li>
                  <li
                    onClick={() => this.setState({ mainContent: 'smart-restocking' })}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px 12px', 
                      fontSize: 14, 
                      borderRadius: '4px', 
                      marginBottom: '4px',
                      color: this.state.mainContent === 'smart-restocking' ? '#0f766e' : '#134e4a',
                      background: this.state.mainContent === 'smart-restocking' 
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)' 
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (this.state.mainContent !== 'smart-restocking') {
                        e.target.style.background = 'rgba(13, 148, 136, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (this.state.mainContent !== 'smart-restocking') {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    📦 Smart Restocking
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
                  padding: '11px 14px',
                  borderRadius: '12px',
                  background: openDropdown === 'requests' ? 
                    'linear-gradient(135deg, #0d9488, #14b8a6)' : 'rgba(255,255,255,0.7)',
                  color: openDropdown === 'requests' ? '#ffffff' : '#134e4a',
                  marginBottom: '8px',
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

            </ul>
          </nav>

          <div className="dashboard-content" style={{ 
            flex: 1, 
            padding: '24px',
            marginLeft: '264px',
            background: 'transparent',
            minHeight: `calc(100vh - ${LAYOUT_TOP_OFFSET}px)`,
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

            {/* Dashboard Page */}
            {mainContent === 'dashboard' && (
              <div style={{
                width: '100%',
                maxWidth: 1360,
                margin: '20px auto',
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24
              }}>
                <h2 style={{ fontWeight: 800, color: '#334155', fontSize: 28, marginBottom: 8 }}>
                  Overview
                </h2>
                <p style={{ color: '#475569', marginTop: 0, marginBottom: 20, fontSize: 15 }}>
                  Quick summary of your current inventory and sales status.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>Sales Period:</span>
                  {[
                    { key: 'today', label: 'Today' },
                    { key: 'week', label: 'This Week' },
                    { key: 'month', label: 'This Month' }
                  ].map((period) => (
                    <button
                      key={period.key}
                      onClick={() => this.setState({ dashboardSalesPeriod: period.key })}
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: 999,
                        padding: '8px 14px',
                        cursor: 'pointer',
                        background: this.state.dashboardSalesPeriod === period.key ? '#0ea5e9' : '#fff',
                        color: this.state.dashboardSalesPeriod === period.key ? '#fff' : '#334155',
                        fontSize: 13,
                        fontWeight: 700
                      }}
                    >
                      {period.label}
                    </button>
                  ))}
                  {searchQuery && (
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#0f766e',
                      background: '#ccfbf1',
                      border: '1px solid #99f6e4',
                      borderRadius: 999,
                      padding: '5px 10px'
                    }}>
                      Filter active: "{this.state.topSearchQuery}"
                    </span>
                  )}
                </div>

                <div className="dashboard-kpi-grid" style={{ marginBottom: 24 }}>
                  <div
                    className="dashboard-kpi-primary"
                    style={{
                      ...baseCardStyle,
                      background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                      border: '1px solid #1e40af',
                      color: '#ffffff',
                      boxShadow: '0 10px 24px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    <div style={{ fontSize: 13, color: 'rgba(219, 234, 254, 0.95)', fontWeight: 700, letterSpacing: '0.02em' }}>
                      PRIMARY KPI
                    </div>
                    <div style={{ fontSize: 14, color: '#e2e8f0', marginTop: 6, fontWeight: 700 }}>
                      Total Sales ({selectedSalesLabel})
                    </div>
                    <div style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', marginTop: 8 }}>
                      ₱{selectedSalesValue.toFixed(2)}
                    </div>
                  </div>
                  <div className="dashboard-kpi-card" style={{ ...baseCardStyle, background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontSize: 13, color: '#334155', fontWeight: 700 }}>Total Products</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>{totalProducts}</div>
                  </div>
                  <div className="dashboard-kpi-card" style={{ ...baseCardStyle, background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontSize: 13, color: '#334155', fontWeight: 700 }}>Total Stock Quantity</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>{totalStockQuantity}</div>
                  </div>
                  <div className="dashboard-kpi-card" style={{ ...baseCardStyle, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                    <div style={{ fontSize: 13, color: '#9a3412', fontWeight: 700 }}>Low Stock Items</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#7c2d12', marginTop: 8 }}>{lowStockItemsCount}</div>
                  </div>
                  <div className="dashboard-kpi-card" style={{ ...baseCardStyle, background: '#fef2f2', border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: 13, color: '#991b1b', fontWeight: 700 }}>Out of Stock Items</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#7f1d1d', marginTop: 8 }}>{outOfStockItemsCount}</div>
                  </div>
                </div>

                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: 18,
                  marginBottom: 24,
                  background: '#ffffff'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                    marginBottom: 14
                  }}>
                    <h3 style={{ margin: 0, fontSize: 20, color: '#1e293b' }}>🚨 Low Stock & Critical Alerts</h3>
                    <button
                      onClick={() => {
                        this.fetchInventoryItems();
                        this.fetchCriticalItems();
                      }}
                      style={{
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        borderRadius: 10,
                        padding: '8px 12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: '#334155'
                      }}
                    >
                      Refresh
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12, fontSize: 13, fontWeight: 700 }}>
                    <span style={{ color: '#166534' }}>● Green: Normal</span>
                    <span style={{ color: '#c2410c' }}>● Orange: Low Stock</span>
                    <span style={{ color: '#b91c1c' }}>● Red: Critical</span>
                  </div>

                  {visibleAffectedStockItems.length === 0 ? (
                    <div style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: 10,
                      padding: 12,
                      color: '#166534',
                      fontWeight: 700
                    }}>
                      All products are currently in normal status.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {visibleAffectedStockItems.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            border: `1px solid ${item.stockStatus.color}`,
                            borderRadius: 10,
                            padding: 12,
                            display: 'grid',
                            gridTemplateColumns: '1.3fr auto auto',
                            gap: 10,
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                            <div style={{ fontSize: 13, color: '#475569' }}>Current Stock: {item.quantity}</div>
                          </div>
                          <span style={{
                            background: item.stockStatus.bg,
                            color: item.stockStatus.color,
                            borderRadius: 999,
                            padding: '4px 10px',
                            fontSize: 12,
                            fontWeight: 700
                          }}>
                            {item.stockStatus.label}
                          </span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => {
                                this.setState({
                                  mainContent: 'update-items',
                                  selectedUpdateItem: item,
                                  updateItemName: item.name,
                                  updateItemQuantity: String(item.quantity),
                                  updateItemPrice: String(item.price || 0),
                                  updateItemCategory: item.category || ''
                                });
                              }}
                              style={{
                                border: 'none',
                                background: '#10b981',
                                color: '#fff',
                                borderRadius: 8,
                                padding: '8px 10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                            >
                              + Restock
                            </button>
                            <button
                              onClick={() => {
                                this.setState({
                                  mainContent: 'update-items',
                                  selectedUpdateItem: item,
                                  updateItemName: item.name,
                                  updateItemQuantity: String(item.quantity),
                                  updateItemPrice: String(item.price || 0),
                                  updateItemCategory: item.category || ''
                                });
                              }}
                              style={{
                                border: 'none',
                                background: '#334155',
                                color: '#fff',
                                borderRadius: 8,
                                padding: '8px 10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                            >
                              Adjust
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: 18,
                  marginBottom: 24,
                  background: '#ffffff'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                    marginBottom: 12
                  }}>
                    <h3 style={{ margin: 0, fontSize: 20, color: '#1e293b' }}>📡 Real-Time Transactions Feed</h3>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#0f766e',
                      background: '#ccfbf1',
                      border: '1px solid #99f6e4',
                      borderRadius: 999,
                      padding: '4px 10px'
                    }}>
                      LIVE ACTIVITY
                    </span>
                  </div>

                  {topFastMovingProducts.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      {topFastMovingProducts.map((item) => (
                        <span
                          key={`fast-${item.name}`}
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#1d4ed8',
                            background: '#dbeafe',
                            border: '1px solid #bfdbfe',
                            borderRadius: 999,
                            padding: '5px 10px'
                          }}
                        >
                          🔥 {item.name} ({item.quantity} sold)
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{
                    maxHeight: 280,
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    background: '#f8fafc'
                  }}>
                    {visibleTransactionEvents.length === 0 ? (
                      <div style={{ padding: 14, color: '#475569', fontSize: 14 }}>
                        No recent transactions yet.
                      </div>
                    ) : (
                      visibleTransactionEvents.map((event) => {
                        const isSale = event.transactionType === 'Sale';
                        return (
                          <div
                            key={event.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'auto 1fr auto',
                              gap: 12,
                              alignItems: 'center',
                              padding: '10px 12px',
                              borderBottom: '1px solid #e2e8f0'
                            }}
                          >
                            <span style={{
                              fontSize: 12,
                              fontWeight: 700,
                              borderRadius: 999,
                              padding: '4px 10px',
                              color: isSale ? '#9a3412' : '#166534',
                              background: isSale ? '#ffedd5' : '#dcfce7'
                            }}>
                              {event.transactionType}
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{event.productName}</div>
                              <div style={{ fontSize: 12, color: '#475569' }}>
                                {event.quantity} {isSale ? 'sold' : 'restocked'}
                              </div>
                            </div>
                            <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'nowrap' }}>
                              {this.getRelativeTimeLabel(event.timestamp)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div style={{
                  marginTop: 8,
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: 22
                }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: 22, color: '#1e293b' }}>Charts & Analytics</h3>
                  <p style={{ margin: '0 0 18px 0', color: '#475569', fontSize: 14 }}>
                    Visual trends and performance tracking for faster decisions.
                  </p>

                  <div
                    className="dashboard-analytics-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                      gap: 18,
                      alignItems: 'stretch'
                    }}
                  >
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, background: '#fff' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: 16, color: '#334155' }}>Bar Chart - Top Selling Products</h4>
                      <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer>
                          <BarChart data={visibleTopSellingProductsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
                            <YAxis tick={{ fontSize: 12, fill: '#334155' }} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #cbd5e1' }} />
                            <Legend wrapperStyle={{ fontSize: 12, color: '#1e293b', paddingTop: 8 }} />
                            <Bar dataKey="quantity" fill="#0ea5e9" name="Units Sold" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, background: '#fff' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: 16, color: '#334155' }}>Pie Chart - Product Categories Distribution</h4>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(220px, 1fr) minmax(180px, 220px)',
                          gap: 12,
                          alignItems: 'stretch'
                        }}
                      >
                        <div style={{ width: '100%', height: 280, minWidth: 0 }}>
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie data={visibleCategoryDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                                {visibleCategoryDistributionData.map((entry, index) => (
                                  <Cell key={`cell-${entry.name}`} fill={pieColors[index % pieColors.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #cbd5e1' }} />
                              <Legend wrapperStyle={{ fontSize: 12, color: '#1e293b', paddingTop: 8 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div style={{
                          borderLeft: '1px solid #e2e8f0',
                          paddingLeft: 12,
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: 0
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                            Category Summary
                          </div>
                          {categoryTotalCount === 0 ? (
                            <div style={{ fontSize: 13, color: '#475569' }}>
                              No category data to summarize.
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gap: 8, overflow: 'auto' }}>
                              {topCategoriesForSummary.map((item, index) => {
                                const value = Number(item.value) || 0;
                                const pct = categoryTotalCount ? Math.round((value / categoryTotalCount) * 100) : 0;
                                return (
                                  <div
                                    key={`cat-summary-${item.name}`}
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: '10px 1fr auto',
                                      gap: 8,
                                      alignItems: 'center'
                                    }}
                                  >
                                    <span style={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: 3,
                                      background: pieColors[index % pieColors.length],
                                      border: '1px solid rgba(15, 23, 42, 0.12)'
                                    }} />
                                    <div style={{ minWidth: 0 }}>
                                      <div style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: '#0f172a',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {item.name}
                                      </div>
                                      <div style={{ fontSize: 12, color: '#475569' }}>
                                        {value} item{value === 1 ? '' : 's'}
                                      </div>
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0f766e' }}>
                                      {pct}%
                                    </div>
                                  </div>
                                );
                              })}
                              {uncategorizedForSummary && (Number(uncategorizedForSummary.value) || 0) > 0 && (
                                <div style={{
                                  marginTop: 8,
                                  paddingTop: 10,
                                  borderTop: '1px solid #e2e8f0',
                                  fontSize: 12,
                                  color: '#92400e',
                                  fontWeight: 700
                                }}>
                                  Note: Uncategorized items detected ({Number(uncategorizedForSummary.value) || 0})
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, background: '#fff' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: 16, color: '#334155' }}>Line Chart - Sales Movement Over Time</h4>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <LineChart data={salesTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
                            <YAxis tick={{ fontSize: 12, fill: '#334155' }} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #cbd5e1' }} />
                            <Legend wrapperStyle={{ fontSize: 12, color: '#1e293b', paddingTop: 8 }} />
                            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue" dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="quantity" stroke="#f59e0b" strokeWidth={3} name="Units Sold" dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Record Sale Page */}
            {mainContent === 'record-sale' && (
              <div className="add-items-panel" style={{
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
                      height: '52px',
                      padding: '0 16px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '12px',
                      fontSize: '16px',
                      lineHeight: '52px',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                      color: '#0f172a',
                      outline: 'none',
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
                      height: '52px',
                      padding: '0 16px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '12px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                      color: '#0f172a',
                      outline: 'none'
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

            {mainContent === 'data-predictions' && (() => {
              const dp = this.buildDataPredictions();
              const trendColor = dp.summary.revTrendPct >= 0 ? '#059669' : '#dc2626';
              return (
              <div style={{
                width: '100%',
                maxWidth: 1200,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 24,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                  <div style={{ flex: '1 1 280px' }}>
                    <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: 24, margin: '0 0 8px 0', textAlign: 'left' }}>
                      🔮 Data Predictions
                    </h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.55, maxWidth: 720 }}>
                      Uses your historical transactions and current stock levels to highlight fast movers, slow inventory, rising demand,
                      and likely stock coverage issues — plus a simple next-week outlook to support planning without relying on manual guesses.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      this.fetchSalesData();
                      this.fetchInventoryItems();
                      this.showToast('Refreshing sales and inventory…', 'success');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 18px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 14,
                      boxShadow: '0 4px 12px rgba(13, 148, 136, 0.35)'
                    }}
                  >
                    ↻ Refresh data
                  </button>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                  marginBottom: 20
                }}>
                  <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#fff', padding: 20, borderRadius: 14 }}>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>At-risk movers (coverage)</div>
                    <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{dp.atRiskCount}</div>
                    <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>High turnover vs low days-of-cover</div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #10b981, #047857)', color: '#fff', padding: 20, borderRadius: 14 }}>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Last 7 days revenue</div>
                    <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>₱{dp.summary.last7Revenue.toLocaleString()}</div>
                    <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>
                      Prev 7d: ₱{dp.summary.prev7Revenue.toLocaleString()}
                      <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.95)' }}>
                        (<span style={{ color: '#fff', fontWeight: 700 }}>{dp.summary.revTrendPct >= 0 ? '+' : ''}{dp.summary.revTrendPct}%</span>)
                      </span>
                    </div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', padding: 20, borderRadius: 14 }}>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Next 7 days (estimate)</div>
                    <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>₱{dp.summary.projectedNext7Revenue.toLocaleString()}</div>
                    <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>~{dp.summary.projectedNext7Units} units (trend-adjusted)</div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', padding: 20, borderRadius: 14 }}>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Sales records used</div>
                    <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{dp.validSalesCount}</div>
                    <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>Rows with a valid sale date</div>
                  </div>
                </div>

                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20
                }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: 16, color: '#0f172a' }}>Predictive insights</h3>
                  <ul style={{ margin: 0, paddingLeft: 20, color: '#334155', fontSize: 14, lineHeight: 1.6 }}>
                    {dp.insightBullets.map((line, idx) => (
                      <li key={idx} style={{ marginBottom: 6 }}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
                  <div style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    padding: 16,
                    minHeight: 280
                  }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: 15, color: '#0f172a' }}>Revenue movement (≈28d)</h3>
                    <div style={{ width: '100%', height: 220 }}>
                      <ResponsiveContainer>
                        <LineChart data={dp.dailyTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                          <Tooltip formatter={(v) => [`₱${Number(v).toLocaleString()}`, 'Revenue']} />
                          <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} dot={false} name="Revenue" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ fontSize: 12, color: trendColor, marginTop: 8, fontWeight: 600 }}>
                      Week-over-week revenue trend: {dp.summary.revTrendPct >= 0 ? '+' : ''}{dp.summary.revTrendPct}%
                    </div>
                  </div>
                  <div style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    padding: 16,
                    minHeight: 280
                  }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: 15, color: '#0f172a' }}>Units sold per day (≈28d)</h3>
                    <div style={{ width: '100%', height: 220 }}>
                      <ResponsiveContainer>
                        <BarChart data={dp.dailyTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                          <Tooltip />
                          <Bar dataKey="units" fill="#6366f1" radius={[4, 4, 0, 0]} name="Units" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: 16, color: '#0f172a', margin: '8px 0 12px 0' }}>Restock priority (from movement + stock)</h3>
                <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12, marginBottom: 20 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                        <th style={{ padding: 12 }}>Product</th>
                        <th style={{ padding: 12 }}>Risk</th>
                        <th style={{ padding: 12 }}>Stock</th>
                        <th style={{ padding: 12 }}>14d sold</th>
                        <th style={{ padding: 12 }}>Days cover</th>
                        <th style={{ padding: 12 }}>Suggest reorder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dp.restockPriority.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                            No restock recommendations right now. Low stock without recent sales still appears in inventory alerts elsewhere.
                          </td>
                        </tr>
                      ) : (
                        dp.restockPriority.map((r) => (
                          <tr key={r.id || r.name} style={{ borderTop: '1px solid #f1f5f9' }}>
                            <td style={{ padding: 12, fontWeight: 600, color: '#0f172a' }}>{r.name}</td>
                            <td style={{ padding: 12 }}>
                              <span style={{
                                fontWeight: 700,
                                fontSize: 12,
                                padding: '4px 8px',
                                borderRadius: 999,
                                background: r.shortageRisk === 'critical' ? '#fee2e2' : r.shortageRisk === 'high' ? '#ffedd5' : '#fef9c3',
                                color: r.shortageRisk === 'critical' ? '#991b1b' : r.shortageRisk === 'high' ? '#c2410c' : '#a16207'
                              }}>
                                {r.shortageRisk}
                              </span>
                            </td>
                            <td style={{ padding: 12 }}>{r.stock}</td>
                            <td style={{ padding: 12 }}>{r.recentQty}</td>
                            <td style={{ padding: 12 }}>{r.daysCover != null ? Math.round(r.daysCover * 10) / 10 : '—'}</td>
                            <td style={{ padding: 12, fontWeight: 700, color: '#0d9488' }}>+{r.suggestedReorder}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Fast-selling (14d)</h4>
                    <ul style={{ margin: 0, paddingLeft: 18, color: '#334155', fontSize: 14, lineHeight: 1.55 }}>
                      {dp.fastSelling.length === 0 ? (
                        <li style={{ listStyle: 'none', marginLeft: -18, color: '#64748b' }}>No movement in the last 14 days for matched products.</li>
                      ) : (
                        dp.fastSelling.map((r) => (
                          <li key={`fast-${r.id || r.name}`}>
                            <strong>{r.name}</strong> — {r.recentQty} sold (avg {r.recentAvgDaily.toFixed(2)}/day)
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Slow-moving (high stock, 14d = 0)</h4>
                    <ul style={{ margin: 0, paddingLeft: 18, color: '#334155', fontSize: 14, lineHeight: 1.55 }}>
                      {dp.slowMoving.length === 0 ? (
                        <li style={{ listStyle: 'none', marginLeft: -18, color: '#64748b' }}>No obvious slow movers by this rule.</li>
                      ) : (
                        dp.slowMoving.map((r) => (
                          <li key={`slow-${r.id || r.name}`}>
                            <strong>{r.name}</strong> — stock {r.stock}, no sales in last 14d
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Rising demand (vs prior 14d)</h4>
                    <ul style={{ margin: 0, paddingLeft: 18, color: '#334155', fontSize: 14, lineHeight: 1.55 }}>
                      {dp.increasingDemand.length === 0 ? (
                        <li style={{ listStyle: 'none', marginLeft: -18, color: '#64748b' }}>No strong demand uptrends detected yet.</li>
                      ) : (
                        dp.increasingDemand.map((r) => (
                          <li key={`inc-${r.id || r.name}`}>
                            <strong>{r.name}</strong> — <span style={{ color: '#059669', fontWeight: 700 }}>+{r.trendPct}%</span> run-rate, {r.recentQty} sold / 14d
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              );
            })()}

            {mainContent === 'demand-forecasting' && (
              <DemandForecasting
                salesData={this.state.salesData}
                inventoryItems={this.state.inventoryItems}
                defaultPeriod={30}
                onRefresh={() => {
                  this.fetchSalesData();
                  this.fetchInventoryItems();
                  this.showToast?.('Refreshing sales and inventory…', 'success');
                }}
              />
            )}

            {mainContent === 'seasonal-predictions' && (
              <SeasonalPredictions
                salesData={this.state.salesData}
                inventoryItems={this.state.inventoryItems}
                onRefresh={() => {
                  this.fetchSalesData();
                  this.fetchInventoryItems();
                  this.showToast?.('Refreshing sales and inventory…', 'success');
                }}
              />
            )}

            {mainContent === 'smart-restocking' && (
              <div className="smart-restocking-container">
                <SmartRestocking />
              </div>
            )}



            {/* Add Items Page */}
            {mainContent === 'add-items-table' && (
              <div style={{
                width: '100%',
                maxWidth: 1200,
                margin: '32px auto',
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}
              onLoad={() => this.fetchCategories()}>
                <div style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 4,
                  background: '#fff',
                  borderBottom: '1px solid #e5e7eb',
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: 22, margin: 0 }}>
                      ➕ Add Items
                    </h2>
                    <div style={{ marginTop: 6, color: '#64748b', fontSize: 13 }}>
                      Fill in quantity and price to auto-compute totals while typing.
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#eef2ff',
                      color: '#4338ca',
                      border: '1px solid #c7d2fe',
                      borderRadius: 999,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 700
                    }}
                    >
                      Rows: {this.state.addItemsRows.length}
                    </span>
                    <button
                      onClick={() => {
                        this.fetchCategories();
                      }}
                      style={{
                        background: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      🔄 Refresh Categories
                    </button>
                  </div>
                </div>
                
                <div style={{ padding: '18px 20px 12px 20px' }}>
                  <div className="add-items-table-wrap" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '52vh', border: '1px solid #e5e7eb', borderRadius: 12 }}>
                  <table className="add-items-grid-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: '1040px' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #5b6ee1, #6f4cc9)' }}>
                        <th style={{ position: 'sticky', top: 0, zIndex: 3, textAlign: 'left', color: '#fff', fontSize: 13, fontWeight: 800 }} className="add-items-grid-th">ID</th>
                        <th style={{ position: 'sticky', top: 0, zIndex: 3, textAlign: 'left', color: '#fff', fontSize: 13, fontWeight: 800 }} className="add-items-grid-th">Item Name</th>
                        <th style={{ position: 'sticky', top: 0, zIndex: 3, textAlign: 'left', color: '#fff', fontSize: 13, fontWeight: 800 }} className="add-items-grid-th">Category</th>
                        <th style={{ position: 'sticky', top: 0, zIndex: 3, textAlign: 'right', color: '#fff', fontSize: 13, fontWeight: 800 }} className="add-items-grid-th">Quantity</th>
                        <th style={{ position: 'sticky', top: 0, zIndex: 3, textAlign: 'right', color: '#fff', fontSize: 13, fontWeight: 800 }} className="add-items-grid-th">Price (₱)</th>
                        <th style={{ position: 'sticky', top: 0, zIndex: 3, textAlign: 'right', color: '#fff', fontSize: 13, fontWeight: 800 }} className="add-items-grid-th">Total Value (₱)</th>
                        <th style={{ position: 'sticky', top: 0, zIndex: 3, textAlign: 'center', color: '#fff', fontSize: 13, fontWeight: 800 }} className="add-items-grid-th">Status</th>
                        <th style={{ position: 'sticky', top: 0, zIndex: 3, textAlign: 'center', color: '#fff', fontSize: 13, fontWeight: 800 }} className="add-items-grid-th">Last Updated</th>
                        <th style={{ position: 'sticky', top: 0, zIndex: 3, textAlign: 'center', color: '#fff', fontSize: 13, fontWeight: 800 }} className="add-items-grid-th">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.addItemsRows.map((row, index) => {
                        const suggestedCategory = this.getSuggestedCategory(row.itemName);
                        const categoryOptions = [...new Set([...(this.state.customCategories || []), ...(suggestedCategory ? [suggestedCategory] : [])])];
                        const quantityValue = parseFloat(row.quantity) || 0;
                        const priceValue = parseFloat(row.price) || 0;
                        const rowTotal = quantityValue * priceValue;
                        const stockStatus = quantityValue > 0 && quantityValue <= this.state.lowStockThreshold ? 'Low Stock' : 'In Stock';
                        const previewDate = new Date().toLocaleDateString('en-US', { month: 'numeric', year: 'numeric' });

                        return (
                        <tr key={index} style={{ background: index % 2 === 0 ? '#ffffff' : '#fafbff' }} className="add-items-grid-row">
                          <td style={{ borderBottom: '1px solid #edf2f7' }} className="add-items-grid-td">
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{index + 1}</div>
                          </td>
                          <td style={{ borderBottom: '1px solid #edf2f7' }} className="add-items-grid-td">
                            <input
                              type="text"
                              value={row.itemName}
                              onChange={(e) => this.handleAddItemsChange(index, 'itemName', e.target.value)}
                              required
                              className="add-items-field"
                              style={{ width: '100%', outline: 'none' }}
                              placeholder="Item name *"
                            />
                          </td>
                          <td style={{ borderBottom: '1px solid #edf2f7' }} className="add-items-grid-td">
                            <select
                              value={row.category}
                              onChange={(e) => this.handleAddItemsChange(index, 'category', e.target.value)}
                              required
                              className="add-items-field"
                              style={{ width: '100%', background: '#fff' }}
                            >
                              <option value="">Select category *</option>
                              {categoryOptions.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                            {suggestedCategory && row.category !== suggestedCategory && (
                              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 12, color: '#4338ca', fontWeight: 700 }}>
                                  Suggested: {suggestedCategory}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => this.applySuggestedCategory(index)}
                                  style={{
                                    border: '1px solid #c7d2fe',
                                    background: '#eef2ff',
                                    color: '#3730a3',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    borderRadius: 999,
                                    padding: '4px 10px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Use Suggestion
                                </button>
                              </div>
                            )}
                          </td>
                          <td style={{ borderBottom: '1px solid #edf2f7' }} className="add-items-grid-td">
                            <input
                              type="number"
                              value={row.quantity}
                              onChange={(e) => this.handleAddItemsChange(index, 'quantity', e.target.value)}
                              required
                              className="add-items-field add-items-number"
                              style={{ width: '100%' }}
                              min="1"
                            />
                          </td>
                          <td style={{ borderBottom: '1px solid #edf2f7' }} className="add-items-grid-td">
                            <input
                              type="number"
                              value={row.price}
                              onChange={(e) => this.handleAddItemsChange(index, 'price', e.target.value)}
                              required
                              className="add-items-field add-items-number"
                              style={{ width: '100%' }}
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td style={{ borderBottom: '1px solid #edf2f7', fontWeight: 800, color: '#0f172a', textAlign: 'right' }} className="add-items-grid-td">
                            ₱{rowTotal.toFixed(2)}
                          </td>
                          <td style={{ borderBottom: '1px solid #edf2f7', textAlign: 'center' }} className="add-items-grid-td">
                            <span style={{
                              display: 'inline-block',
                              borderRadius: 999,
                              padding: '4px 10px',
                              fontSize: 12,
                              fontWeight: 800,
                              color: '#fff',
                              background: stockStatus === 'In Stock' ? '#22c55e' : '#f59e0b'
                            }}>
                              {stockStatus}
                            </span>
                          </td>
                          <td style={{ borderBottom: '1px solid #edf2f7', textAlign: 'center', color: '#334155', fontWeight: 600 }} className="add-items-grid-td">
                            {previewDate}
                          </td>
                          <td style={{ borderBottom: '1px solid #edf2f7', textAlign: 'center' }} className="add-items-grid-td">
                            <button
                              onClick={() => this.removeItemsRow(index)}
                              style={{
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '8px 14px',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: '13px'
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                </div>
                
                <div style={{
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 4,
                  background: '#fff',
                  borderTop: '1px solid #e5e7eb',
                  padding: '14px 20px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 15,
                    fontWeight: 800,
                    color: '#0f172a'
                  }}>
                    Total Amount: ₱{this.state.addItemsRows.reduce((sum, row) => {
                      const quantityValue = parseFloat(row.quantity) || 0;
                      const priceValue = parseFloat(row.price) || 0;
                      return sum + (quantityValue * priceValue);
                    }, 0).toFixed(2)}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      onClick={this.addItemsRow}
                      style={{
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ➕ Add Row
                    </button>
                    <button
                      onClick={this.saveAllItems}
                      style={{
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      💾 Save All Items
                    </button>
                    <button
                      onClick={this.clearAddItemsForm}
                      style={{
                        background: '#f59e0b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      🔄 Clear Form
                    </button>
                  </div>
                </div>
                <style>
                  {`
                    .add-items-grid-th {
                      padding: 14px 16px;
                    }
                    .add-items-grid-td {
                      padding: 14px 16px;
                      vertical-align: top;
                    }
                    .add-items-field {
                      box-sizing: border-box;
                      padding: 11px 12px;
                      margin: 2px 0;
                      border: 1px solid #d1d5db;
                      border-radius: 8px;
                    }
                    .add-items-number {
                      text-align: right;
                    }
                    .add-items-table-wrap::-webkit-scrollbar {
                      height: 10px;
                      width: 10px;
                    }
                    .add-items-table-wrap::-webkit-scrollbar-thumb {
                      background: #cbd5e1;
                      border-radius: 999px;
                    }
                    @media (max-width: 1024px) {
                      .add-items-grid-table {
                        min-width: 920px !important;
                      }
                      .add-items-grid-th,
                      .add-items-grid-td {
                        padding: 12px 12px;
                      }
                    }
                    @media (max-width: 768px) {
                      .add-items-grid-table {
                        min-width: 860px !important;
                      }
                      .add-items-grid-th,
                      .add-items-grid-td {
                        padding: 10px 10px;
                      }
                      .add-items-field {
                        padding: 10px 10px;
                        font-size: 13px;
                      }
                    }
                  `}
                </style>
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
                    {this.state.returnToAllItemsAfterUpdate && (
                      <div style={{
                        gridColumn: '1 / -1',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(200px, 1fr))',
                        gap: 12,
                        marginBottom: 8
                      }}>
                        <div style={{
                          background: '#eef2ff',
                          border: '1px solid #c7d2fe',
                          borderRadius: 8,
                          padding: '10px 12px',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#4338ca'
                        }}>
                          Last Updated: {this.state.selectedUpdateItem.updated_at ? new Date(this.state.selectedUpdateItem.updated_at).toLocaleString() : 'N/A'}
                        </div>
                        <div style={{
                          background: '#ecfeff',
                          border: '1px solid #a5f3fc',
                          borderRadius: 8,
                          padding: '10px 12px',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#155e75'
                        }}>
                          Item Actions: Update in progress
                        </div>
                      </div>
                    )}
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
                    onClick={() => this.setState(prevState => ({
                      selectedUpdateItem: null,
                      updateItemName: '',
                      updateItemQuantity: '',
                      updateItemPrice: '',
                      updateItemCategory: '',
                      returnToAllItemsAfterUpdate: false,
                      mainContent: prevState.returnToAllItemsAfterUpdate ? 'all-items-table' : prevState.mainContent,
                      selectedAllItemsItemId: prevState.returnToAllItemsAfterUpdate ? null : prevState.selectedAllItemsItemId,
                      showAllItemsActionPanel: false
                    }))}
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
                    {this.state.returnToAllItemsAfterUpdate ? '↩️ Cancel' : '🗑️ Clear Selection'}
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
                
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ overflowX: 'auto', flex: 1 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
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
                        {!this.state.showAllItemsActionPanel && !this.state.returnToAllItemsAfterUpdate && (
                          <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', minWidth: 170, width: 170 }}>Item Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.inventoryItems.length === 0 ? (
                        <tr>
                          <td colSpan={!this.state.showAllItemsActionPanel && !this.state.returnToAllItemsAfterUpdate ? 9 : 8} style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                            No items found. Add some items to get started!
                          </td>
                        </tr>
                      ) : (
                        this.state.inventoryItems.map((item, index) => (
                          <tr key={item.id || index} style={{ 
                            background: (item.item_id || item.id) === this.state.selectedAllItemsItemId
                              ? '#eff6ff'
                              : (index % 2 === 0 ? '#fafafa' : '#fff'),
                            cursor: 'pointer'
                          }}
                          onClick={() => this.handleAllItemsRowSelect(item)}>
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
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
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
                              </div>
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                              {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}
                            </td>
                            {!this.state.showAllItemsActionPanel && !this.state.returnToAllItemsAfterUpdate && (
                              <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', minWidth: 170, width: 170 }}>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      this.handleAllItemsRowSelect(item);
                                    }}
                                    style={{
                                      background: '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      height: 32,
                                      minWidth: 72,
                                      padding: '0 12px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      lineHeight: 1
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      this.handleDeleteInventoryItem(item);
                                    }}
                                    style={{
                                      background: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      height: 32,
                                      minWidth: 72,
                                      padding: '0 12px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      lineHeight: 1
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  </div>
                  {this.state.showAllItemsActionPanel && selectedAllItemsItem && (
                    <aside style={{
                      width: 300,
                      flexShrink: 0,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: 14,
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a' }}>Item Actions</h3>
                        <button
                          onClick={this.closeAllItemsActionPanel}
                          style={{
                            height: 36,
                            minWidth: 36,
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: 15,
                            fontWeight: 700,
                            lineHeight: 1
                          }}
                        >
                          ×
                        </button>
                      </div>

                      <div style={{ marginBottom: 14, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                        <div><strong>Name:</strong> {selectedAllItemsItem.item_name || selectedAllItemsItem.name}</div>
                        <div><strong>Category:</strong> {selectedAllItemsItem.category || 'Uncategorized'}</div>
                        <div><strong>Current Qty:</strong> {selectedAllItemsItem.quantity}</div>
                        <div><strong>Price:</strong> ₱{(parseFloat(selectedAllItemsItem.price) || 0).toFixed(2)}</div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Quantity Control</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '36px minmax(0, 1fr) 36px', alignItems: 'center', gap: 8 }}>
                          <button
                            onClick={() => this.handleAdjustStock(selectedAllItemsItem, 'subtract')}
                            disabled={!!this.state.stockAdjustLoading[selectedAllItemsItem.item_id || selectedAllItemsItem.id]}
                            style={{
                              height: 36,
                              minWidth: 36,
                              border: 'none',
                              borderRadius: 8,
                              background: '#ef4444',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: 16,
                              fontWeight: 700,
                              lineHeight: 1
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={this.state.stockAdjustInputs[selectedAllItemsItem.item_id || selectedAllItemsItem.id] || ''}
                            onChange={(e) => this.handleStockAdjustInputChange(selectedAllItemsItem.item_id || selectedAllItemsItem.id, e.target.value)}
                            style={{
                              height: 36,
                              flex: 1,
                              minWidth: 0,
                              border: '1px solid #cbd5e1',
                              borderRadius: 8,
                              padding: '0 10px',
                              fontSize: 12,
                              fontWeight: 600,
                              boxSizing: 'border-box'
                            }}
                          />
                          <button
                            onClick={() => this.handleAdjustStock(selectedAllItemsItem, 'add')}
                            disabled={!!this.state.stockAdjustLoading[selectedAllItemsItem.item_id || selectedAllItemsItem.id]}
                            style={{
                              height: 36,
                              minWidth: 36,
                              marginLeft: -2,
                              border: 'none',
                              borderRadius: 8,
                              background: '#10b981',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: 16,
                              fontWeight: 700,
                              lineHeight: 1
                            }}
                          >
                            <span style={{ display: 'inline-block', transform: 'translateX(-2px)' }}>+</span>
                          </button>
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Quick Sell</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 92px', alignItems: 'center', gap: 8 }}>
                          <input
                            type="number"
                            min="1"
                            max={selectedAllItemsItem.quantity}
                            placeholder="Sell Qty"
                            value={this.state.quickSaleInputs[selectedAllItemsItem.item_id || selectedAllItemsItem.id] || ''}
                            onChange={(e) => this.handleQuickSaleInputChange(selectedAllItemsItem.item_id || selectedAllItemsItem.id, e.target.value)}
                            style={{
                              height: 36,
                              flex: 1,
                              minWidth: 0,
                              border: '1px solid #cbd5e1',
                              borderRadius: 8,
                              padding: '0 10px',
                              fontSize: 12,
                              fontWeight: 600,
                              boxSizing: 'border-box'
                            }}
                          />
                          <button
                            onClick={() => this.handleQuickSale(selectedAllItemsItem)}
                            disabled={selectedAllItemsItem.quantity === 0}
                            style={{
                              height: 36,
                              minWidth: 92,
                              border: 'none',
                              borderRadius: 8,
                              background: selectedAllItemsItem.quantity === 0 ? '#cbd5e1' : '#10b981',
                              color: '#fff',
                              cursor: selectedAllItemsItem.quantity === 0 ? 'not-allowed' : 'pointer',
                              fontSize: 12,
                              fontWeight: 700,
                              lineHeight: 1
                            }}
                          >
                            Sell
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => {
                            this.closeAllItemsActionPanel();
                            this.openItemUpdateFromAllItems(selectedAllItemsItem);
                          }}
                          style={{
                            height: 36,
                            flex: 1,
                            border: 'none',
                            borderRadius: 8,
                            background: '#3b82f6',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 700,
                            lineHeight: 1
                          }}
                        >
                          Update
                        </button>
                        <button
                          onClick={() => this.handleDeleteInventoryItem(selectedAllItemsItem)}
                          style={{
                            height: 36,
                            flex: 1,
                            border: 'none',
                            borderRadius: 8,
                            background: '#ef4444',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 700,
                            lineHeight: 1
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </aside>
                  )}
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
            {false && (
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
