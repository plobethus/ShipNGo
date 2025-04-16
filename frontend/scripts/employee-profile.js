/*
 * /ShipNGo/frontend/scripts/employee-profile.js
 * Client-side JavaScript for the employee profile page
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

// Employee profile data elements
const employeeName = document.getElementById('employee-name');
const employeeEmail = document.getElementById('employee-email');
const employeePhone = document.getElementById('employee-phone');
const employeeAddress = document.getElementById('employee-address');

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
    // First check if user is logged in
    try {
      // Making an API call to check authentication
      const authResponse = await fetch('/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // If not authenticated, redirect to login
      if (!authResponse.ok) {
        window.location.href = '/pages/login.html';
        return;
      }
      
      // Check user role from auth response
      const authData = await authResponse.json();
      if (authData.role !== 'employee' && authData.role !== 'manager') {
        console.error("Not authorized as employee");
        window.location.href = '/index.html';
        return;
      }
    } catch (authError) {
      console.error("Authentication check failed:", authError);
      window.location.href = '/pages/login.html';
      return;
    }
    
    // Initially hide the edit forms
    profileEdit.style.display = 'none';
    passwordEdit.style.display = 'none';
    profileView.style.display = 'block';

    // Load profile data
    await loadProfileData();
    
    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error("Failed to load profile:", error);
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
    editName.value = employeeName.textContent;
    editEmail.value = employeeEmail.textContent;
    editPhone.value = employeePhone.textContent;
    editAddress.value = employeeAddress.textContent;
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
    
    console.log("Making request to /api/employee-profile");
    const response = await fetch('/api/employee-profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'  // Explicitly request JSON response
      }
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      let errorMessage = `Failed to load profile data (${response.status})`;
      
      try {
        // Try to parse error as JSON
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If can't parse as JSON, try to get text
        try {
          const errorText = await response.text();
          console.error("Error response text:", errorText);
        } catch (textError) {
          console.error("Couldn't read error response as text");
        }
      }
      
      throw new Error(errorMessage);
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
  employeeName.textContent = profileData.name || 'N/A';
  employeeEmail.textContent = profileData.email || 'N/A';
  employeePhone.textContent = formatPhoneNumber(profileData.phone) || 'N/A';
  employeeAddress.textContent = profileData.address || 'N/A';
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
    
    const response = await fetch('/api/employee-profile/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'  // Explicitly request JSON response
      },
      body: JSON.stringify(profileData)
    });

    console.log("Update response status:", response.status);
    
    if (!response.ok) {
      let errorMessage = `Failed to update profile (${response.status})`;
      
      try {
        // Try to parse error as JSON
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If can't parse as JSON, try to get text
        try {
          const errorText = await response.text();
          console.error("Error response text:", errorText);
        } catch (textError) {
          console.error("Couldn't read error response as text");
        }
      }
      
      throw new Error(errorMessage);
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
    
    const response = await fetch('/api/employee-profile/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'  // Explicitly request JSON response
      },
      body: JSON.stringify(passwordData)
    });
    
    console.log("Password change response status:", response.status);
    
    if (!response.ok) {
      let errorMessage = response.status === 400 ? 'Current password is incorrect' : 'Failed to change password';
      
      try {
        // Try to parse error as JSON
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If can't parse as JSON, try to get text
        try {
          const errorText = await response.text();
          console.error("Error response text:", errorText);
        } catch (textError) {
          console.error("Couldn't read error response as text");
        }
      }
      
      throw new Error(errorMessage);
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