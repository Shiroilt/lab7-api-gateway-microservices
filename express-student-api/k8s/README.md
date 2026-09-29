# Lab 8 Kubernetes manifests

These manifests continue the Lab 7 application.

Before applying them, create the MongoDB Atlas Secret without committing it:

```bash
kubectl create secret generic lab8-mongodb -n lab8 --from-literal=MONGODB_URI='YOUR_MONGODB_ATLAS_URI'
```

Do NOT put the real MongoDB URI/password into this repository.

Expected local Kubernetes image names:
- lab7-api-gateway:latest
- lab7-user-service:latest
- lab7-product-service:latest
- lab7-order-service:latest

The ConfigMap contains only non-sensitive internal service URLs.
