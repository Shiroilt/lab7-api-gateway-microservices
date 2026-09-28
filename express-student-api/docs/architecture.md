# Lab 7 Architecture

Client / Postman
        |
        v
API Gateway :3000
   |       |       |
 /users /products /orders
   |       |       |
 User   Product   Order
 :3001  :3002    :3003
   |       |       |
 MongoDB databases

Gateway + services share the Docker network. Only gateway port 3000 is mapped to the host.
