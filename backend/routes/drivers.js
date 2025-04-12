//ShipNGo/backend/routes/drivers.js

const { sendJson } = require("../helpers");
const stopsController = require("../controllers/stopsController");
const { readJsonBody } = require("../helpers");
const routeController = require("../controllers/drivingRouteController")

async function getActiveRoutesByCurrentEmployee(req, res) {
    try {
        const tokenData = req.tokenData;

        if (!tokenData || !tokenData.employee_id) {
            sendJson(res, 401, { message: "Invalid token. Please log in as an employee." });
            return;
        }

        const employee_id = tokenData.employee_id;
        const allRoutes = await routeController.getRoutesForEmployee(employee_id);

        const activeRoutes = allRoutes.filter(route =>
            route.status !== 'Completed'
        );

        sendJson(res, 200, allRoutes);
    } catch (err) {
        sendJson(res, 500, { message: err.message });
    }
}

async function getOrderedStopsForRoute(req, res, route_id) {
    try {
        const orderedStops = await stopsController.getOrderedStopsByRouteId(route_id);
        sendJson(res, 200, orderedStops);
    } catch (err) {
        sendJson(res, 500, { message: err.message });
    }
}

async function appendStopToRoute(req, res) {
    try {
        const body = await readJsonBody(req);
        const { route_id, address, special_instructions } = body;

        if (!route_id || !address) {
            sendJson(res, 400, { message: "Missing route_id or address." });
            return;
        }

        

        const newStopId = await stopsController.createStop(
            route_id,
            address,
            special_instructions || null,
            null
        );

        sendJson(res, 201, { stop_id: newStopId});
    } catch (err) {
        sendJson(res, 500, { message: err.message });
    }
}

async function deleteStopFromRoute(req, res, stop_id) {
    try {
        if (!stop_id) {
            sendJson(res, 400, { message: "Missing stop_id." });
            return;
        }


        const result = await stopsController.deleteStop(stop_id);
        if (result > 0) {
            sendJson(res, 200, { message: "Stop deleted successfully." });
        } else {
            sendJson(res, 404, { message: "Stop not found." });
        }
    } catch (err) {
        sendJson(res, 500, { message: err.message });
    }
}

module.exports = {
    getActiveRoutesByCurrentEmployee,
    getOrderedStopsForRoute,
    deleteStopFromRoute,
    appendStopToRoute
}