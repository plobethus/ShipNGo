//ShipNGo/backend/routes/shop.js

const { sendJson, readJsonBody, verifyToken } = require("../helpers");
const shopController = require("../controllers/shopController");


async function checkout(req, res) {
    try {
        const userId = await verifyToken(req);
        const body = await readJsonBody(req);





        if (!Array.isArray(body.items)) {
            return sendJson(res, 400, { error: "Invalid items format" });
        }

        await shopController.performCheckout(userId, body.items);

        sendJson(res, 200, { success: true, message: "Checkout completed successfully" });

    } catch (err) {
        console.error("Checkout Error:", err);
        sendJson(res, 500, { error: err.message || "Internal Server Error" });
    }
}

async function getStocks(req, res) {
    try {
        let stocks = []
        
        const items = await shopController.getItems();

        items.forEach(item => {
            stocks.push({id: item.category, available: item.stock_quantity});
        });

        sendJson(res, 200, stocks);

    } catch (err) {
        console.error("Checkout Error:", err);
        sendJson(res, 500, { error: err.message || "Internal Server Error" });
    }
}

async function restock(req, res) {
    try {
        const body = await readJsonBody(req);





        if (!Array.isArray(body.updates)) {
            return sendJson(res, 400, { error: "Invalid items format" });
        }

        await shopController.updateItems(body.updates);

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