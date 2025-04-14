//ShipNGo/backend/controllers/drivingRouteController.js
const db = require("../db");

async function createRoute(employee_id,
    destination,
    departure_time,
    arrival_time,
    tracking_log,
    status,
    location,
    stop_id,
    origin,
    truck,
    estimated_duation,
    route_name) {


    const sql = `
        INSERT INTO routes (
            employee_id, destination, departure_time, arrival_time, 
            tracking_log, status, location, stop_id, origin, 
            truck, estimated_duation, route_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        employee_id, destination, departure_time, arrival_time,
        tracking_log, status, location, stop_id, origin,
        truck, estimated_duation, route_name
    ];

    const [result] = await db.execute(sql, values);
    return result.insertId;
}

async function getRoutesForEmployee(employee_id) {

    const [rows] = await db.execute("SELECT * FROM routes WHERE employee_id = ?", [employee_id])

    return rows
}

async function updateRouteStatus(route_id, status) {
    const [result] = await db.execute(
        "UPDATE routes SET status = ? WHERE route_id = ?",
        [status, route_id]
    );
    return result.affectedRows;
}


async function deleteRoute(route_id) {
    const [result] = await db.execute(
        "DELETE FROM routes WHERE route_id = ?",
        [route_id]
    );
    return result.affectedRows;
}

async function getRouteById(route_id) {
    const [rows] = await db.execute(
        "SELECT * FROM routes WHERE route_id = ?",
        [route_id]
    );
    return rows[0];
}




module.exports = {
    createRoute,
    getRoutesForEmployee,
    updateRouteStatus,
    deleteRoute,
    getRouteById
}