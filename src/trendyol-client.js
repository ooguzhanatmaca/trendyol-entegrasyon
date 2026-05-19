const BASE_URLS = {
  prod: "https://apigw.trendyol.com",
  stage: "https://stageapigw.trendyol.com"
};

export class TrendyolClient {
  constructor({ supplierId, apiKey, apiSecret, environment = "prod", userAgentSuffix = "SelfIntegration" }) {
    this.supplierId = supplierId;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = BASE_URLS[environment] || BASE_URLS.prod;
    this.userAgent = `${supplierId} - ${userAgentSuffix}`;
  }

  async request(path, { method = "GET", query, body } = {}) {
    const url = new URL(path, this.baseUrl);
    for (const [key, value] of Object.entries(query || {})) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    }

    const headers = {
      Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64")}`,
      "User-Agent": this.userAgent,
      Accept: "application/json"
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });

    const text = await response.text();
    const data = text ? safeJson(text) : null;

    if (!response.ok) {
      const message = data?.message || data?.exception || response.statusText;
      throw new TrendyolError(message, response.status, data);
    }

    return data;
  }

  getProducts(query = {}) {
    return this.request(`/integration/product/sellers/${this.supplierId}/products`, { query });
  }

  getOrders(query = {}) {
    return this.request(`/integration/order/sellers/${this.supplierId}/orders`, { query });
  }

  updatePriceAndInventory(items) {
    return this.request(`/integration/inventory/sellers/${this.supplierId}/products/price-and-inventory`, {
      method: "POST",
      body: { items }
    });
  }

  getBrands(query = {}) {
    return this.request("/integration/product/brands", { query });
  }
}

export class TrendyolError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "TrendyolError";
    this.status = status;
    this.details = details;
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
