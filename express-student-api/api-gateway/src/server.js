const express = require("express");
const http = require("http");
const https = require("https");

const app = express();
const PORT = Number(process.env.GATEWAY_PORT || 3000);

const services = {
  users: {
    url: process.env.USER_SERVICE_URL,
    name: "User Service"
  },
  products: {
    url: process.env.PRODUCT_SERVICE_URL,
    name: "Product Service"
  },
  orders: {
    url: process.env.ORDER_SERVICE_URL,
    name: "Order Service"
  }
};

if (Object.values(services).some(service => !service.url)) {
  console.error("Missing service URL configuration");
  process.exit(1);
}

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "api-gateway"
  });
});

function proxyRequest(service, req, res) {
  const target = new URL(service.url);

  const options = {
    hostname: target.hostname,
    port: target.port || (target.protocol === "https:" ? 443 : 80),
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: target.host
    },
    timeout: 5000
  };

  const client = target.protocol === "https:" ? https : http;

  const proxy = client.request(options, (proxyRes) => {
    console.log(
      `[gateway] ${req.method} ${req.originalUrl} -> ${service.name} ${proxyRes.statusCode}`
    );

    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxy.on("timeout", () => {
    proxy.destroy(new Error("Proxy timeout"));
  });

  proxy.on("error", (err) => {
    console.error(
      `[gateway] ${req.method} ${req.originalUrl} -> ${service.name} ERROR: ${err.message}`
    );

    if (!res.headersSent) {
      res.status(503).json({
        error: "Service unavailable",
        service: service.name
      });
    }
  });

  req.pipe(proxy);
}

function routeToService(service) {
  return (req, res) => {
    proxyRequest(service, req, res);
  };
}

app.use("/users", routeToService(services.users));
app.use("/products", routeToService(services.products));
app.use("/orders", routeToService(services.orders));

app.use((req, res) => {
  res.status(404).json({
    error: "Gateway route not found"
  });
});

app.listen(PORT, () => {
  console.log(`[gateway] listening on port ${PORT}`);
  console.log(`[gateway] User Service: ${services.users.url}`);
  console.log(`[gateway] Product Service: ${services.products.url}`);
  console.log(`[gateway] Order Service: ${services.orders.url}`);
});
