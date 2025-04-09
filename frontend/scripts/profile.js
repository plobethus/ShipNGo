/**
 * Change the user's password
 */
async function changePassword() {
    try {
      showLoading(true);
      
      // Get values from form
      const currentPass = currentPassword.value;
      const newPass = newPassword.value;
      const confirmPass = confirmPassword.value;
      
      // Basic validation
      if (!currentPass || !newPass || !confirmPass) {
        throw new Error('All password fields are required');
      }
      
      if (newPass.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }
      
      if (newPass !== confirmPass) {
        throw new Error('New passwords do not match');
      }
      
      // Prepare password data
      const passwordData = {
        currentPassword: currentPass,
        newPassword: newPass
      };
      
      console.log("Changing password...");
      
      const response = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });
      
      console.log("Password change response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(response.status === 400 ? 'Current password is incorrect' : 'Failed to change password');
      }
      
      const result = await response.json();
      console.log("Password change result:", result.success);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to change password');
      }
      
      // Show success message
      showSuccess('Password changed successfully!');
      
      // Reset form fields
      currentPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
      
      // Return to profile view
      passwordEdit.style.display = 'none';
      profileView.style.display = 'block';
      
    } catch (error) {
      console.error("Error in changePassword:", error);
      showError(error.message);
    } finally {
      showLoading(false);
    }
  }/*
   * /ShipNGo/frontend/scripts/profile.js
   * Client-side JavaScript for the profile page
   */
  
  // DOM Elements
  const profileView = document.getElementById('profile-view');
  const profileEdit = document.getElementById('profile-edit');
  const passwordEdit = document.getElementById('password-edit');
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const changePasswordBtn = document.getElementById('change-password-btn');
  const cancelEditBtn = document.getElementById('cancel-edit');
  const cancelPasswordBtn = document.getElementById('cancel-password');
  const editProfileForm = document.getElementById('edit-profile-form');
  const passwordForm = document.getElementById('password-form');
  
  // Customer profile data elements
  const customerName = document.getElementById('customer-name');
  const customerEmail = document.getElementById('customer-email');
  const customerPhone = document.getElementById('customer-phone');
  const customerAddress = document.getElementById('customer-address');
  
  // Form input elements
  const editName = document.getElementById('edit-name');
  const editEmail = document.getElementById('edit-email');
  const editPhone = document.getElementById('edit-phone');
  const editAddress = document.getElementById('edit-address');
  
  // Password form elements
  const currentPassword = document.getElementById('current-password');
  const newPassword = document.getElementById('new-password');
  const confirmPassword = document.getElementById('confirm-password');
  
  // Initial setup
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      // No need to check localStorage since we're using HttpOnly cookies
      // The cookie is automatically sent with requests
      
      // Initially hide the edit form
      profileEdit.style.display = 'none';
      profileView.style.display = 'block';
  
      // Load profile data
      await loadProfileData();
      
      // Set up event listeners
      setupEventListeners();
    } catch (error) {
      console.error("Failed to load profile:", error);
      // If loading fails due to auth issues, redirect to login
      if (error.message.includes("Unauthorized") || error.message.includes("Token")) {
        window.location.href = '/pages/login.html';
      }
    }
  });
  
  /**
   * Set up all event listeners for the profile page
   */
  function setupEventListeners() {
    // Edit profile button
    editProfileBtn.addEventListener('click', () => {
      // Show edit form and hide profile view and password edit
      profileView.style.display = 'none';
      profileEdit.style.display = 'block';
      passwordEdit.style.display = 'none';
      
      // Populate form fields with current values
      editName.value = customerName.textContent;
      editEmail.value = customerEmail.textContent;
      editPhone.value = customerPhone.textContent;
      editAddress.value = customerAddress.textContent;
    });
  
    // Change password button
    changePasswordBtn.addEventListener('click', () => {
      // Show password form and hide profile view and edit form
      profileView.style.display = 'none';
      profileEdit.style.display = 'none';
      passwordEdit.style.display = 'block';
      
      // Clear password fields
      currentPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
    });
  
    // Cancel edit button
    cancelEditBtn.addEventListener('click', () => {
      // Hide edit form and show profile view
      profileEdit.style.display = 'none';
      profileView.style.display = 'block';
    });
    
    // Cancel password change button
    cancelPasswordBtn.addEventListener('click', () => {
      // Hide password form and show profile view
      passwordEdit.style.display = 'none';
      profileView.style.display = 'block';
    });
  
    // Form submission for profile edit
    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await updateProfile();
    });
    
    // Form submission for password change
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await changePassword();
    });
  }
  
  /**
   * Load profile data from the server
   */
  async function loadProfileData() {
    try {
      showLoading(true);
      
      console.log("Making request to /api/profile");
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
        // No need to manually add token - cookies are sent automatically
      });
  
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Unauthorized: Your session may have expired');
        } else {
          throw new Error(`Failed to load profile data (${response.status})`);
        }
      }
  
      const result = await response.json();
      console.log("Profile data retrieved:", result.success);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to load profile data');
      }
  
      // Update the profile view with data
      updateProfileView(result.data);
      return true;
      
    } catch (error) {
      console.error("Error in loadProfileData:", error);
      showError(error.message);
      throw error; // Re-throw to allow calling code to handle it
    } finally {
      showLoading(false);
    }
  }
  
  /**
   * Update profile view with data from the server
   */
  function updateProfileView(profileData) {
    customerName.textContent = profileData.name || 'N/A';
    customerEmail.textContent = profileData.email || 'N/A';
    customerPhone.textContent = formatPhoneNumber(profileData.phone) || 'N/A';
    customerAddress.textContent = profileData.address || 'N/A';
  }
  
  /**
   * Update profile data on the server
   */
  async function updateProfile() {
    try {
      showLoading(true);
      
      // Basic validation
      if (!editName.value.trim()) {
        throw new Error('Name cannot be empty');
      }
      
      if (!editEmail.value.trim() || !editEmail.value.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      // Prepare profile data from form - only send fields the backend expects
      const profileData = {
        name: editName.value.trim(),
        email: editEmail.value.trim(),
        phone: editPhone.value.replace(/\D/g, ''), // Remove non-digits
        address: editAddress.value.trim()
      };
  
      console.log("Updating profile with data:", JSON.stringify(profileData));
      
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
        // No need to manually add token - cookies are sent automatically
      });
  
      console.log("Update response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to update profile (${response.status})`);
      }
  
      const result = await response.json();
      console.log("Update result:", result.success);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update profile');
      }
  
      // Show success message
      showSuccess('Profile updated successfully!');
      
      // Reload profile data to reflect changes
      await loadProfileData();
      
      // Switch back to view mode
      profileEdit.style.display = 'none';
      profileView.style.display = 'block';
      
    } catch (error) {
      console.error("Error in updateProfile:", error);
      showError(error.message);
    } finally {
      showLoading(false);
    }
  }
  
  // Utility Functions
  
  /**
   * Format phone number to (XXX) XXX-XXXX
   */
  function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    // Convert to string and ensure we have only digits
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    
    // Check if the number has 10 digits
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // If not 10 digits, return as is
    return phoneNumber;
  }
  
  /**
   * Show loading indicator
   */
  function showLoading(isLoading) {
    // Implement loading indicator if needed
    if (isLoading) {
      // Show loading
      document.body.style.cursor = 'wait';
    } else {
      // Hide loading
      document.body.style.cursor = 'default';
    }
  }
  
  /**
   * Show error message
   */
  function showError(message) {
    alert('Error: ' + message);
  }
  
  /**
   * Show success message
   */
  function showSuccess(message) {
    alert('Success: ' + message);
  }