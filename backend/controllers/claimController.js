/*
* /ShipNGo/backend/controllers/claimController.js
* Complete bypass of customersupport table
*/

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

async function createClaim({ firstName, lastName, email, phone, issueType, issueDescription, userId }) {
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
    
    // Only insert into claims table
    const claimsSql = `
      INSERT INTO claims 
      (ticket_id, first_name, last_name, email, phone_number, issue_type, reason, customer_id, refund_status, processed_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
    `;

    const claimsParams = [
      ticketId,
      safeFirstName,
      safeLastName,
      safeEmail,
      phoneCleaned,
      safeIssueType,
      safeIssueDescription,
      userId || null
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