/*
* /ShipNGo/backend/controllers/profileController.js
*/

const bcrypt = require('bcryptjs');
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

/**
 * Get customer profile information
 * @param {number} customerId - The customer ID
 * @returns {Promise<Object>} - Customer profile data
 */
async function getCustomerProfile(customerId) {
  console.log("Getting profile for customer ID:", customerId);
  
  try {
    // Remove created_at from the query since it doesn't exist in the table
    const [rows] = await db.execute(
      "SELECT customer_id, name, email, phone, address FROM customers WHERE customer_id = ?",
      [customerId]
    );
    
    console.log("Query results:", rows.length > 0 ? "Customer found" : "No customer found");
    
    if (rows.length === 0) {
      throw new Error("Customer not found");
    }
    
    // Format the data for consistency
    const customerData = rows[0];
    
    // Make sure phone is properly formatted for display
    if (customerData.phone) {
      // Store as string to prevent number precision issues
      customerData.phone = customerData.phone.toString();
    }
    
    return customerData;
  } catch (error) {
    console.error("Database error in getCustomerProfile:", error.message);
    throw error;
  }
}

/**
 * Update customer profile information
 * @param {number} customerId - The customer ID
 * @param {Object} profileData - The updated profile data
 * @returns {Promise<Object>} - Result of the update operation
 */
async function updateCustomerProfile(customerId, profileData) {
  // Only allow updating these fields
  const allowedFields = ['name', 'phone', 'address', 'email'];
  const updates = [];
  const values = [];
  
  // Build the update query dynamically based on provided fields
  for (const field of allowedFields) {
    if (profileData[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(profileData[field]);
    }
  }
  
  if (updates.length === 0) {
    return { affectedRows: 0 };
  }
  
  // Add the customerId to the values array for the WHERE clause
  values.push(customerId);
  
  const query = `UPDATE customers SET ${updates.join(', ')} WHERE customer_id = ?`;
  const [result] = await db.execute(query, values);
  
  return result;
}

/**
 * Change customer password
 * @param {number} customerId - The customer ID
 * @param {string} currentPassword - The current password
 * @param {string} newPassword - The new password
 * @returns {Promise<boolean>} - Success/failure of password change
 */
async function changeCustomerPassword(customerId, currentPassword, newPassword) {
  // First verify current password
  const [rows] = await db.execute(
    "SELECT password FROM customers WHERE customer_id = ?",
    [customerId]
  );
  
  if (rows.length === 0) {
    throw new Error("Customer not found");
  }
  
  const validPassword = await bcrypt.compare(currentPassword, rows[0].password);
  if (!validPassword) {
    return false;
  }
  
  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  // Update the password
  const [result] = await db.execute(
    "UPDATE customers SET password = ? WHERE customer_id = ?",
    [hashedPassword, customerId]
  );
  
  return result.affectedRows > 0;
}

module.exports = {
  getCustomerProfile,
  updateCustomerProfile,
  changeCustomerPassword
};