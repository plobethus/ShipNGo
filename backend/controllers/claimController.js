//ShipNGo/backend/controllers/claimController.js

const db = require("../db"); 

(async () => {
  try {
    await db.query("SET time_zone = '-05:00' ");
    console.log("MySQL timezone set to America/Chicago");
  } catch (err) {
    console.error("Failed to set MySQL timezone:", err);
  }
})();

async function createClaim({ firstName, lastName, email, phone, package_id, issueType, issueDescription, userId }) {
  const min = 100000;
  const max = 999999;
  const ticketId = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log("Generated ticket_id:", ticketId);

  const safeFirstName = firstName || "";
  const safeLastName = lastName || "";
  const safeEmail = email || "";
  const phoneCleaned = phone ? phone.replace(/\D/g, '') : '';
  const safePackageId = package_id !== undefined ? package_id : null;

  const validIssueTypes = ['Lost', 'Delayed', 'Damaged', 'Other'];
  let safeIssueType = issueType || "Other"; 

  if (!validIssueTypes.includes(safeIssueType)) {
    console.log(`Warning: Invalid issue type "${safeIssueType}", defaulting to "Other"`);
    safeIssueType = "Other";
  }

  const safeIssueDescription = issueDescription || "";

  try {
    console.log("BYPASSING customersupport table completely - inserting directly to claims");
    console.log("Package ID to be inserted:", safePackageId);
    
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
      'Pending'
    ];

    const [result] = await db.execute(claimsSql, claimsParams);
    console.log("Successfully inserted into claims with ticket_id:", ticketId);

    return {
      claimId: result.insertId,
      ticketId
    };
  } catch (err) {
    console.error("ERROR in createClaim:", err.message);
    console.error("Full error:", err);
    throw err;
  }
}

async function checkTableStructure() {
  try {
    console.log("Checking table structures");

    const [supportColumns] = await db.execute("DESCRIBE customersupport");
    console.log("customersupport table structure:");
    supportColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

   
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