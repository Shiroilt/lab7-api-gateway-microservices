# Lab 7 — API Gateway, Service Discovery & Cloud Deployment

This extends Lab 6 without changing User, Product or Order endpoints/status codes.

## Architecture
Client/Postman -> API Gateway -> User/Product/Order Services -> MongoDB.

Only port 3000 is exposed externally. Backend services are reachable through the Docker network.

## Gateway
- GET /health
- /users/* -> User Service
- /products/* -> Product Service
- /orders/* -> Order Service

The gateway performs routing, logging and gateway-level error handling; business logic remains in the services.

## Configuration-based service discovery
The gateway reads USER_SERVICE_URL, PRODUCT_SERVICE_URL and ORDER_SERVICE_URL from environment variables. URLs are not literal values inside route definitions. This allows service locations to change through configuration.

Static/config-based discovery requires configuration updates when locations change. Dynamic systems such as Consul, Eureka or Kubernetes DNS can discover changing service instances automatically.

## Why an API Gateway?
It gives clients one entry point, hides internal service locations, and centralizes cross-cutting concerns such as logging and error handling.

## Local run
docker compose config
docker compose up -d --build
docker compose ps

Gateway: http://localhost:3000/health

Use the gateway for client requests instead of directly calling backend ports.

## Cloud
Deploy the gateway and backend containers on the selected platform. Set service URLs and MongoDB Atlas URIs through platform environment variables. Record the public gateway URL and deployment dashboard/CLI evidence.

## Reflection
Lab 6 allowed clients to call each microservice directly. Lab 7 changes the access pattern to one API Gateway entry point. The gateway hides internal service locations and centralizes logging and gateway-level failures. Configuration-based discovery allows service locations to change without editing route code. Cloud deployment makes the gateway reachable from outside the local machine. The resulting system is closer to a remotely operated distributed application.
