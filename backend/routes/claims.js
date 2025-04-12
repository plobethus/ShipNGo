/*
* /ShipNGo/backend/routes/claims.js
* Updated to handle package_id field and only show user-specific claims
*/

const path = require("path");
const { sendJson, serveFile, readJsonBody } = require("../helpers");
const claimController = require("../controllers/claimController");
const db = require("mysql2").createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

async function fileClaim(req, res) {
  try {
    const body = await readJsonBody(req);
    console.log("======== BACKEND ROUTE RECEIVED DATA ========");
    console.log("Raw request body:", JSON.stringify(body, null, 2));
    
    // Extract fields from the request body
    const { 
      firstName, lastName, name, email, phone, package_id, claimType, reason, issue
    } = body;
    
    console.log("Extracted fields:");
    console.log("firstName:", firstName);
    console.log("lastName:", lastName);
    console.log("email:", email);
    console.log("phone:", phone);
    console.log("package_id:", package_id);
    console.log("claimType:", claimType);
    console.log("reason/issue:", reason || issue);
    console.log("============================================");
    
    // The frontend might send either 'reason' or 'issue' for the description field
    const issueDescription = reason || issue || "";
    
    // FIXED: Map the frontend claimType values to the backend ENUM values
    // Frontend: "Delayed", "Lost", "Damaged", "Other"
    // Backend: "Delayed", "Lost", "Damaged", "Other"
    let mappedClaimType = claimType || "Other"; // Default to "Other"
    
    // Handle first name/last name splitting if needed
    let firstNameValue = firstName || "";
    let lastNameValue = lastName || "";
    
    // If we have a combined name but not firstName/lastName, split it
    if (name && (!firstName && !lastName)) {
      const nameParts = name.split(' ');
      firstNameValue = nameParts[0] || "";
      lastNameValue = nameParts.slice(1).join(' ') || "";
    }
    
    // Get customer_id from token if available (mapped from user_id in the token)
    let userId = null;
    if (req.tokenData) {
      userId = req.tokenData.id || req.tokenData.customer_id || null;
    }
    
    // Process packageId - convert to integer if possible
    // Fixed to handle '0' as a valid packageId
    let safePackageId = null;
    if (package_id !== undefined && package_id !== '') {
      safePackageId = parseInt(package_id, 10);
      // Only set to null if it's explicitly NaN
      if (isNaN(safePackageId)) {
        safePackageId = null;
      }
      // Log the parsed package ID for debugging
      console.log("Parsed package_id:", package_id, "→", safePackageId);
    }
    
    // KEY FIX: Ensure all params match exactly what controller expects
    console.log("======== PASSING TO CONTROLLER ========");
    const controllerParams = {
      firstName: firstNameValue,
      lastName: lastNameValue,
      email: email,
      phone: phone,
      package_id: safePackageId,
      issueType: mappedClaimType,  // This is now validated
      issueDescription: issueDescription,
      userId: userId
    };
    console.log("Controller params:", JSON.stringify(controllerParams, null, 2));
    console.log("======================================");
    
    // Send to controller with fixed parameter mapping
    const result = await claimController.createClaim(controllerParams);
    
    console.log("Claim created successfully with result:", result);
    
    sendJson(res, 201, {
      message: "Claim submitted successfully",
      ticketId: result.ticketId,
      claimId: result.claimId
    });
  } catch (err) {
    console.error("Error filing claim:", err);
    sendJson(res, 400, { message: err.message || "An error occurred while filing the claim" });
  }
}

function serveClaimsPage(req, res) {
  const fileToServe = path.join(__dirname, "../../frontend/pages/claims.html");
  serveFile(res, fileToServe);
}

// Enhanced getClaims function with user-specific filtering
async function getClaims(req, res) {
  console.log("============= GET CLAIMS FUNCTION CALLED =============");
  console.log("HTTP Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);
  
  try {
    // Get user ID from token
    let userId = null;
    let userRole = null;

    if (req.tokenData) {
      userId = req.tokenData.id || req.tokenData.customer_id || null;
      userRole = req.tokenData.role || null;
      console.log("User ID from token:", userId);
      console.log("User role from token:", userRole);
    } else {
      console.log("No token data available on request object");
      sendJson(res, 401, { 
        success: false, 
        message: "Not authenticated" 
      });
      return;
    }

    // If no user ID is available, return an error
    if (!userId) {
      console.log("No user ID found in token");
      sendJson(res, 400, { 
        success: false, 
        message: "User ID not found" 
      });
      return;
    }

    console.log("Attempting to query the database for claims...");
    
    // Different query based on user role
    let query;
    let queryParams = [];

    if (userRole === 'employee' || userRole === 'admin') {
      // Employees and admins can see all claims
      console.log("User is an employee/admin - can see all claims");
      query = `
        SELECT * FROM claims
        ORDER BY processed_date DESC
      `;
    } else {
      // Regular customers can only see their own claims
      console.log("User is a customer - only showing their claims");
      query = `
        SELECT * FROM claims
        WHERE customer_id = ?
        ORDER BY processed_date DESC
      `;
      queryParams.push(userId);
    }
    
    console.log("Executing SQL query:", query);
    console.log("With parameters:", queryParams);
    
    // Execute the query
    const [claims] = await db.execute(query, queryParams);
    console.log(`Query successful! Retrieved ${claims.length} claims`);
    
    if (claims.length > 0) {
      console.log("First claim data sample:", JSON.stringify(claims[0], null, 2));
    } else {
      console.log("No claims found for this user");
    }
    
    // Send the claims data as JSON
    console.log("Sending response to client...");
    sendJson(res, 200, { 
      success: true, 
      claims 
    });
    console.log("Response sent successfully");
  } catch (err) {
    console.error("ERROR in getClaims:", err);
    console.error("Stack trace:", err.stack);
    
    // Try to get more information about the database connection
    try {
      const connection = await db.getConnection();
      console.log("Database connection successful");
      connection.release();
    } catch (connErr) {
      console.error("Database connection error:", connErr);
    }
    
    sendJson(res, 500, { 
      success: false, 
      message: "Error loading support tickets",
      error: err.message
    });
  }
  
  console.log("============= GET CLAIMS FUNCTION COMPLETED =============");
}

module.exports = {
  fileClaim,
  serveClaimsPage,
  getClaims
};