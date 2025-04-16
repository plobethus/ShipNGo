//ShipNGo/backend/controllers/packageController.js

const db = require("../db");

async function getAllPackages(filter) {

  let query = `
    SELECT 
      p.package_id,                               
      p.weight,                                   
      p.dimensions,                               
      p.address_from,                             
      p.address_to,                               
      p.created_at,                              
      c1.name AS sender_name,                     
      p.receiver_name,                           
      l.location_id,                             
      l.location_name,                            
      l.manager_id,                     
      l.opening_time,
      l.closing_time,                               
      (
        SELECT t.status                      
        FROM package_tracking_log t
        WHERE t.package_id = p.package_id
        ORDER BY t.changed_at DESC
        LIMIT 1
      ) AS latest_status,
      (
        SELECT e.name                      
        FROM employees e
        WHERE e.employee_id = l.manager_id
        LIMIT 1
      ) AS manager_name  
    FROM packages p
    LEFT JOIN customers c1 ON p.sender_id = c1.customer_id
    LEFT JOIN (
    SELECT t1.*
    FROM package_tracking_log t1
    JOIN (
      SELECT package_id, MAX(changed_at) AS max_changed_at
      FROM package_tracking_log
      GROUP BY package_id
    ) t2 ON t1.package_id = t2.package_id AND t1.changed_at = t2.max_changed_at
  ) t ON p.package_id = t.package_id
  LEFT JOIN locations l ON t.location = l.location_id
    WHERE 1=1
  `;

  const values = [];
  if (filter.status) {
    query += `
      AND COALESCE((
        SELECT t2.status
        FROM package_tracking_log t2
        WHERE t2.package_id = p.package_id
        ORDER BY t2.changed_at DESC
        LIMIT 1
      ), "Pending") = ?
    `;
    values.push(filter.status);
  }
  if (filter.customerName) {
    query += " AND c1.name LIKE ?";
    values.push(`%${filter.customerName}%`);
  }
  if (filter.minWeight) {
    query += " AND p.weight >= ?";
    values.push(filter.minWeight);
  }
  if (filter.maxWeight) {
    query += " AND p.weight <= ?";
    values.push(filter.maxWeight);
  }
  if (filter.address) {
    query += " AND (p.address_from LIKE ? OR p.address_to LIKE ?)";
    values.push(`%${filter.address}%`, `%${filter.address}%`);
  }

  if (filter.startDate) {
    query += " AND p.created_at >= ?";
    values.push(filter.startDate);
  }
  if (filter.endDate) {
    query += " AND p.created_at <= ?";
    values.push(filter.endDate);
  }

  if (filter.locationId) {
    query += `
      AND (
        SELECT t2.location
        FROM package_tracking_log t2
        WHERE t2.package_id = p.package_id
        ORDER BY t2.changed_at DESC
        LIMIT 1
      ) = ?
    `;
    values.push(filter.locationId);
  }

  const [packages] = await db.execute(query, values);
  return packages;
}

//IMPORTANT!! Doesnt update tracking so update tracking in the route
async function updatePackage(id, data) {
  let query = "UPDATE packages SET ";
  const updates = [];
  const values = [];

  if (data.weight) {
    updates.push("weight = ?");
    values.push(data.weight);
  }
  if (data.address_from) {
    updates.push("address_from = ?");
    values.push(data.address_from);
  }
  if (data.address_to) {
    updates.push("address_to = ?");
    values.push(data.address_to);
  }

  if (updates.length === 0 ) {
    if ((data["location_id"] || data["status"])){
      return; //No updates to package, only to tracking;
    }
    throw new Error("No valid fields provided to update.");
  }

  query += updates.join(", ") + " WHERE package_id = ?";
  values.push(id);

  const [result] = await db.execute(query, values);
  return result.affectedRows;
}

async function getCustomerPackages(customerId) {
  const query = `
    SELECT 
  p.package_id,
  p.sender_id,
  p.weight,
  p.address_from,
  p.address_to,
  p.receiver_name,
  COALESCE(t.status, 'Pending') AS status
  FROM packages p
  LEFT JOIN (
      SELECT t1.package_id, t1.status,
      FROM package_tracking_log t1
      JOIN (
          SELECT package_id, MAX(changed_at) AS max_changed_at
          FROM package_tracking_log
          GROUP BY package_id
      ) t2 ON t1.package_id = t2.package_id AND t1.changed_at = t2.max_changed_at
  ) t ON p.package_id = t.package_id
  WHERE p.sender_id = ?
    OR p.address_to = (SELECT address FROM customers WHERE customer_id = ?)
`;
  const [packages] = await db.execute(query, [customerId, customerId]);
  console.log(package);
  return packages;
}

async function createPackage({
  sender_id,
  sender_name,
  receiver_name,
  address_from,
  address_to,
  weight,
  dimensions,
  shipping_class,
}) {
  // Step 1: Count how many shipments this customer has
  const [countResult] = await db.execute(
    "SELECT COUNT(*) AS total FROM packages WHERE sender_id = ?",
    [sender_id]
  );

  const totalShipments = countResult[0].total;
  const nextShipmentNumber = totalShipments + 1;

  // Step 2: Determine discount
  let discount = 0;
  let next_discount_unlocked = false;

  if (nextShipmentNumber % 3 === 0) {
    discount = 10; // 10% discount on every 3rd shipment
  }

  if (nextShipmentNumber === 2 || nextShipmentNumber % 3 === 2) {
    next_discount_unlocked = true; // "You've unlocked a 10% discount for your next shipment!"
  }

  // Step 3: Calculate shipping cost
  const baseCost = 5 + weight * 0.5;  // Base cost calculation
  const shippingCost = parseFloat(baseCost.toFixed(2));  // Round to 2 decimal places

  // Step 4: Final cost after applying discount
  const finalCost = parseFloat((shippingCost * (1 - discount / 100)).toFixed(2));

  // Step 5: Insert new package
  const sql = `
    INSERT INTO packages
      (sender_id, receiver_name, weight, dimensions, shipping_class, cost, address_from, address_to, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  const values = [
    sender_id,
    receiver_name,
    weight,
    dimensions,
    shipping_class.charAt(0).toUpperCase() + shipping_class.slice(1),
    finalCost,
    address_from,
    address_to
  ];

  const [result] = await db.execute(sql, values);

  return {
    package: {
      package_id: result.insertId,
      sender_name,
      receiver_name,
      address_from,
      address_to,
      weight,
      shipping_class,
      cost: finalCost,
      status: "Pending",
      location: address_to,
      created_at: new Date()
    },
    discount_applied: discount,
    next_discount_unlocked: next_discount_unlocked
  };
}

async function deletePackage(id) {
  const query = "DELETE FROM packages WHERE package_id = ?";
  const [result] = await db.execute(query, [id]);
  return result.affectedRows;
}

module.exports = {
  getAllPackages,
  updatePackage,
  getCustomerPackages,
  createPackage,
  deletePackage
};
