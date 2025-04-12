//ShipNGo/backend/controllers/profileController.js


const bcrypt = require('bcryptjs');
const db = require("../db"); 

/**
 * Get customer profile information
 * @param {number} customerId - The customer ID
 * @returns {Promise<Object>} - Customer profile data
 */
async function getCustomerProfile(customerId) {
  console.log("Getting profile for customer ID:", customerId);
  
  try {

    const [rows] = await db.execute(
      "SELECT customer_id, name, email, phone, address FROM customers WHERE customer_id = ?",
      [customerId]
    );
    
    console.log("Query results:", rows.length > 0 ? "Customer found" : "No customer found");
    
    if (rows.length === 0) {
      throw new Error("Customer not found");
    }
    
    const customerData = rows[0];
    
    if (customerData.phone) {
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
  const allowedFields = ['name', 'phone', 'address', 'email'];
  const updates = [];
  const values = [];
  
  for (const field of allowedFields) {
    if (profileData[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(profileData[field]);
    }
  }
  
  if (updates.length === 0) {
    return { affectedRows: 0 };
  }
  
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
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
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