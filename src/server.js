import http from "node:http";
import { getConfig } from "./env.js";
import { TrendyolClient, TrendyolError } from "./trendyol-client.js";

const config = getConfig();
const client = config.missing.length ? null : new TrendyolClient(config);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/health") {
      return sendJson(response, 200, {
        ok: config.missing.length === 0,
        environment: config.environment,
        missing: config.missing
      });
    }

    if (!client) {
      return sendJson(response, 400, {
        error: "Trendyol ayarlari eksik.",
        missing: config.missing
      });
    }

    if (request.method === "GET" && url.pathname === "/products") {
      const data = await client.getProducts(Object.fromEntries(url.searchParams));
      return sendJson(response, 200, data);
    }

    if (request.method === "GET" && url.pathname === "/orders") {
      const data = await client.getOrders(Object.fromEntries(url.searchParams));
      return sendJson(response, 200, data);
    }

    if (request.method === "GET" && url.pathname === "/brands") {
      const data = await client.getBrands(Object.fromEntries(url.searchParams));
      return sendJson(response, 200, data);
    }

    if (request.method === "GET" && url.pathname === "/commissions") {
      const now = Date.now();
      const query = {
        transactionType: "Sale",
        startDate: now - 30 * 24 * 60 * 60 * 1000,
        endDate: now,
        page: 0,
        size: 50,
        ...Object.fromEntries(url.searchParams)
      };
      const data = await client.getFinancialTransactions(query);
      const items = (data?.content || []).map((item) => ({
        orderNumber: item.orderNumber,
        barcode: item.barcode,
        transactionDate: item.transactionDate,
        commissionRate: item.commissionRate,
        commissionAmount: item.commissionAmount,
        saleAmount: item.credit,
        sellerRevenue: item.sellerRevenue
      }));

      return sendJson(response, 200, {
        page: data?.page,
        size: data?.size,
        totalPages: data?.totalPages,
        totalElements: data?.totalElements,
        items
      });
    }

    if (request.method === "POST" && url.pathname === "/price-and-inventory") {
      const payload = await readJson(request);
      const data = await client.updatePriceAndInventory(payload.items || []);
      return sendJson(response, 200, data);
    }

    sendJson(response, 404, { error: "Endpoint bulunamadi." });
  } catch (error) {
    if (error instanceof TrendyolError) {
      return sendJson(response, error.status, {
        error: error.message,
        details: error.details
      });
    }

    sendJson(response, 500, { error: error.message });
  }
});

server.listen(config.port, () => {
  console.log(`Trendyol entegrasyon servisi http://localhost:${config.port} adresinde calisiyor.`);
});

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data, null, 2));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}
