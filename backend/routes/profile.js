/*
* /ShipNGo/backend/routes/profile.js
*/

const { sendJson, readJsonBody } = require("../helpers");
const profileController = require("../controllers/profileController");

/**
 * Get profile information for the authenticated customer
 */
async function getProfile(req, res) {
  try {
    console.log("getProfile route hit, tokenData:", req.tokenData);
    
    // Check if tokenData exists
    if (!req.tokenData) {
      console.log("No token data found");
      return sendJson(res, 401, { 
        success: false, 
        message: "Unauthorized. Authentication token missing or invalid." 
      });
    }
    
    const customerId = req.tokenData.customer_id;
    console.log("Customer ID from token:", customerId);
    
    // Verify this is a customer request
    if (req.tokenData.role !== "customer") {
      console.log("Non-customer role attempted to access profile:", req.tokenData.role);
      return sendJson(res, 403, { 
        success: false, 
        message: "Access denied. Customer access only." 
      });
    }
    
    if (!customerId) {
      console.log("No customer ID in token data");
      return sendJson(res, 401, { 
        success: false, 
        message: "Unauthorized. Valid customer login required." 
      });
    }
    
    const profileData = await profileController.getCustomerProfile(customerId);
    console.log("Profile data retrieved successfully");
    
    sendJson(res, 200, { 
      success: true, 
      data: profileData 
    });
  } catch (err) {
    console.error("Error in getProfile:", err.message);
    sendJson(res, 500, { 
      success: false, 
      message: err.message || "An error occurred while fetching profile data."
    });
  }
}

/**
 * Update profile information for the authenticated customer
 */
async function updateProfile(req, res) {
  try {
    const customerId = req.tokenData.customer_id;
    
    if (!customerId) {
      return sendJson(res, 401, { 
        success: false, 
        message: "Unauthorized. Valid customer login required." 
      });
    }
    
    const profileData = await readJsonBody(req);
    
    // Validate required fields
    if (!profileData) {
      return sendJson(res, 400, { 
        success: false, 
        message: "No profile data provided."
      });
    }
    
    const result = await profileController.updateCustomerProfile(customerId, profileData);
    
    if (result.affectedRows === 0) {
      return sendJson(res, 400, { 
        success: false, 
        message: "No changes made to profile."
      });
    }
    
    sendJson(res, 200, { 
      success: true, 
      message: "Profile updated successfully." 
    });
  } catch (err) {
    sendJson(res, 500, { 
      success: false, 
      message: err.message || "An error occurred while updating profile."
    });
  }
}

/**
 * Change password for the authenticated customer
 */
async function changePassword(req, res) {
  try {
    const customerId = req.tokenData.customer_id;
    
    if (!customerId) {
      return sendJson(res, 401, { 
        success: false, 
        message: "Unauthorized. Valid customer login required." 
      });
    }
    
    const passwordData = await readJsonBody(req);
    
    // Validate required fields
    if (!passwordData || !passwordData.currentPassword || !passwordData.newPassword) {
      return sendJson(res, 400, { 
        success: false, 
        message: "Current password and new password are required."
      });
    }
    
    // Validate new password
    if (passwordData.newPassword.length < 8) {
      return sendJson(res, 400, { 
        success: false, 
        message: "New password must be at least 8 characters long."
      });
    }
    
    const success = await profileController.changeCustomerPassword(
      customerId, 
      passwordData.currentPassword, 
      passwordData.newPassword
    );
    
    if (!success) {
      return sendJson(res, 400, { 
        success: false, 
        message: "Current password is incorrect."
      });
    }
    
    sendJson(res, 200, { 
      success: true, 
      message: "Password changed successfully." 
    });
  } catch (err) {
    sendJson(res, 500, { 
      success: false, 
      message: err.message || "An error occurred while changing password."
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};