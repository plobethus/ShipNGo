//ShipNGo/backend/routes/employee-profile.js

const { sendJson, readJsonBody } = require("../helpers");
const employeeProfileController = require("../controllers/employeeProfileController");

async function getEmployeeProfile(req, res) {
  try {
    console.log("Employee getProfile route hit, tokenData:", req.tokenData);

    if (!req.tokenData) {
      console.log("No token data found");
      return sendJson(res, 401, {
        success: false,
        message: "Unauthorized. Authentication token missing or invalid."
      });
    }

    const employeeId = req.tokenData.employee_id;
    console.log("Employee ID from token:", employeeId);

    // Fixed condition: Changed OR to AND, fixed variable name 'employee' to string "employee"
    if (req.tokenData.role !== "employee") {
      console.log("Unauthorized role attempted to access employee profile:", req.tokenData.role);
      return sendJson(res, 403, {
        success: false,
        message: "Access denied. Employee access only."
      });
    }

    if (!employeeId) {
      console.log("No employee ID in token data");
      return sendJson(res, 401, {
        success: false,
        message: "Unauthorized. Valid employee login required."
      });
    }

    const employeeProfileData = await employeeProfileController.getEmployeeProfile(employeeId);
    console.log("Employee profile data retrieved successfully");

    sendJson(res, 200, {
      success: true,
      data: employeeProfileData
    });
  } catch (err) {
    console.error("Error in employee getProfile:", err.message);
    sendJson(res, 500, {
      success: false,
      message: err.message || "An error occurred while fetching profile data."
    });
  }
}

async function updateEmployeeProfile(req, res) {
  try {
    const employeeId = req.tokenData.employee_id;

    if (!employeeId) {
      return sendJson(res, 401, {
        success: false,
        message: "Unauthorized. Valid employee login required."
      });
    }

    // Make sure only employees can update employee profiles
    if (req.tokenData.role !== "employee") {
      return sendJson(res, 403, {
        success: false,
        message: "Access denied. Employee access only."
      });
    }

    const employeeProfileData = await readJsonBody(req);

    if (!employeeProfileData) {
      return sendJson(res, 400, {
        success: false,
        message: "No profile data provided."
      });
    }

    const result = await employeeProfileController.updateEmployeeProfile(employeeId, employeeProfileData);

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

async function changePassword(req, res) {
  try {
    const employeeId = req.tokenData.employee_id;

    if (!employeeId) {
      return sendJson(res, 401, {
        success: false,
        message: "Unauthorized. Valid employee login required."
      });
    }

    // Make sure only employees can change employee passwords
    if (req.tokenData.role !== "employee") {
      return sendJson(res, 403, {
        success: false,
        message: "Access denied. Employee access only."
      });
    }

    const passwordData = await readJsonBody(req);

    if (!passwordData || !passwordData.currentPassword || !passwordData.newPassword) {
      return sendJson(res, 400, {
        success: false,
        message: "Current password and new password are required."
      });
    }

    if (passwordData.newPassword.length < 8) {
      return sendJson(res, 400, {
        success: false,
        message: "New password must be at least 8 characters long."
      });
    }

    const success = await employeeProfileController.changeEmployeePassword(
      employeeId,
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
  getEmployeeProfile,
  updateEmployeeProfile,
  changePassword
};