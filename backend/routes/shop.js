//ShipNGo/backend/routes/shop.js

const { sendJson, readJsonBody, verifyToken } = require("../helpers");
const shopController = require("../controllers/shopController");


async function checkout(req, res, query) {
    try {
        const userId = await verifyToken(req);
        const body = await readJsonBody(req);


        


        if (!Array.isArray(body.items)) {
            return sendJson(res, 400, { error: "Invalid items format" });
        }

        await shopController.performCheckout(userId, body.items, query.location_id);

        sendJson(res, 200, { success: true, message: "Checkout completed successfully" });

    } catch (err) {
        console.error("Checkout Error:", err);
        sendJson(res, 500, { error: err.message || "Internal Server Error" });
    }
}

async function getStocks(req, res, query) {
    try {
        let stocks = []
        console.log(query);
        const items = await shopController.getItems(query.location_id);

        items.forEach(item => {
            stocks.push({id: item.category, available: item.stock_quantity});
        });

        sendJson(res, 200, stocks);

    } catch (err) {
        console.error("Checkout Error:", err);
        sendJson(res, 500, { error: err.message || "Internal Server Error" });
    }
}

async function restock(req, res, query) {
    try {
        const body = await readJsonBody(req);





        if (!Array.isArray(body.updates)) {
            return sendJson(res, 400, { error: "Invalid items format" });
        }

        await shopController.updateItems(body.updates, query.location_id);

        sendJson(res, 200, { success: true, message: "Restock completed successfully" });

    } catch (err) {
        console.error("Checkout Error:", err);
        sendJson(res, 500, { error: err.message || "Internal Server Error" });
    }
}

module.exports = {
    checkout,
    getStocks,
    restock
}