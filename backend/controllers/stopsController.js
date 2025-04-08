
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

async function getStop(stop_id) {
    
    const [rows] = await db.execute("SELECT * FROM stops WHERE stop_id = ?", [stop_id])

    return rows
}

async function getOrderedStopsByRouteId(route_id) {
    const [rows] = await db.execute("SELECT * FROM stops WHERE route_id = ? ORDER BY stop_order", [route_id]);

    return rows;
}



async function createStop(route_id, address, special_instructions, previous_stop_id) {

    let new_stop_order

    if (previous_stop_id) {
        const [prevStopRows] = await db.execute(
            "SELECT stop_order FROM stops WHERE stop_id = ? AND route_id = ?",
            [previous_stop_id, route_id]
          );

        if (!prevStopRows.length){
            throw new Error("Invalid previous stop")
        }

        new_stop_order = prevStopRows[0].stop_order + 1

        await db.execute(
            "UPDATE stops SET stop_order = stop_order + 1 WHERE route_id = ? AND stop_order >= ?",
            [route_id, new_stop_order]
          );
    } else {
        const [rows] = await db.execute(
            "SELECT stop_order FROM stops WHERE route_id = ? ORDER BY stop_order DESC LIMIT 1",
            [route_id]
          );
        new_stop_order = rows.length ? rows[0].stop_order + 1 : 1;
    }
    
    const [result] = await db.execute(
        "INSERT INTO stops (route_id, address, special_instructions, stop_order) VALUES (?, ?, ?, ?)",
        [route_id, address, special_instructions, new_stop_order]
    );

    const newStopId = result.insertId;


    return newStopId;
}

async function deleteStop(stop_id) {
    const [stops] = await db.execute(
      "SELECT route_id, stop_order FROM stops WHERE stop_id = ?",
      [stop_id]
    );
    if (stops.length === 0) {
      return 0;
    }
  
    const { route_id, stop_order } = stops[0];
  
    const [result] = await db.execute("DELETE FROM stops WHERE stop_id = ?", [stop_id]);
  
    await db.execute(
      "UPDATE stops SET stop_order = stop_order - 1 WHERE route_id = ? AND stop_order > ?",
      [route_id, stop_order]
    );
  
    return result.affectedRows;
  }

module.exports = {
    getStop,
    getOrderedStopsByRouteId,
    createStop,
    deleteStop
}