//ShipNGo/backend/controllers/claimController.js

const db = require("../db"); 

// Set MySQL session time zone to Central Time (CST/CDT)
(async () => {
  try {
    await db.query("SET time_zone = '-05:00' ");
    console.log("✅ MySQL timezone set to America/Chicago");
  } catch (err) {
    console.error("❌ Failed to set MySQL timezone:", err);
  }
})();

async function createClaim({ firstName, lastName, email, phone, package_id, issueType, issueDescription, userId }) {
  // Generate a numeric ticket_id (ensure it's a number)
  const min = 100000;
  const max = 999999;
  const ticketId = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log("Generated ticket_id:", ticketId);

  // Prepare safe values
  const safeFirstName = firstName || "";
  const safeLastName = lastName || "";
  const safeEmail = email || "";
  const phoneCleaned = phone ? phone.replace(/\D/g, '') : '';
  // Fix for packageId: check if it's undefined rather than falsy to handle 0 correctly
  const safePackageId = package_id !== undefined ? package_id : null;

  // Map to valid ENUM values based on the actual database schema
  const validIssueTypes = ['Lost', 'Delayed', 'Damaged', 'Other'];
  let safeIssueType = issueType || "Other"; // Default to "Other" if no value provided

  // If issueType is not in the valid list, set it to "Other" as a fallback
  if (!validIssueTypes.includes(safeIssueType)) {
    console.log(`Warning: Invalid issue type "${safeIssueType}", defaulting to "Other"`);
    safeIssueType = "Other";
  }

  const safeIssueDescription = issueDescription || "";

  try {
    console.log("BYPASSING customersupport table completely - inserting directly to claims");
    console.log("Package ID to be inserted:", safePackageId);
    
    // Only insert into claims table - now including package_id field
    const claimsSql = `
      INSERT INTO claims 
      (ticket_id, first_name, last_name, email, phone_number, package_id, issue_type, reason, customer_id, refund_status, processed_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const claimsParams = [
      ticketId,
      safeFirstName,
      safeLastName,
      safeEmail,
      phoneCleaned,
      safePackageId,
      safeIssueType,
      safeIssueDescription,
      userId || null,
      'pending'
    ];

    // Execute the SQL
    const [result] = await db.execute(claimsSql, claimsParams);
    console.log("Successfully inserted into claims with ticket_id:", ticketId);

    return {
      claimId: result.insertId,
      ticketId
    };
  } catch (err) {
    // Log specific error information
    console.error("ERROR in createClaim:", err.message);
    console.error("Full error:", err);
    throw err;
  }
}

// Utility function to check table structure
async function checkTableStructure() {
  try {
    console.log("Checking table structures");

    // Check customersupport table structure
    const [supportColumns] = await db.execute("DESCRIBE customersupport");
    console.log("customersupport table structure:");
    supportColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // Check claims table structure
    const [claimsColumns] = await db.execute("DESCRIBE claims");
    console.log("claims table structure:");
    claimsColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    return {
      supportColumns,
      claimsColumns
    };
  } catch (err) {
    console.error("Error checking table structure:", err);
    throw err;
  }
}

module.exports = {
  createClaim,
  checkTableStructure
};