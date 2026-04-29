# Deployment Guide - FraudGuard

This guide provides detailed instructions for deploying FraudGuard to production environments.

## Table of Contents

1. [Docker Deployment (Recommended)](#docker-deployment)
2. [Cloud Platforms](#cloud-platforms)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Manual Server Deployment](#manual-server-deployment)
5. [SSL/HTTPS Setup](#sslhttps-setup)
6. [Monitoring & Logs](#monitoring--logs)
7. [Backup & Recovery](#backup--recovery)
8. [Troubleshooting](#troubleshooting)

---

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Step 1: Prepare Environment

```bash
# Clone repository
git clone https://github.com/yourusername/fraud-detection-mern.git
cd fraud-detection-mern

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Generate secure JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT_SECRET=$JWT_SECRET" >> backend/.env
```

### Step 2: Configure Services

Edit `backend/.env`:
```env
MONGO_URI=mongodb://admin:changeme@mongodb:27017/fraud_detection?authSource=admin
JWT_SECRET=your-generated-secret-key
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

Edit `frontend/.env`:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=FraudGuard
```

### Step 3: Build and Deploy

```bash
# Build images
docker-compose build

# Start services in background
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Step 4: Verify Deployment

```bash
# Check health endpoints
curl http://localhost:5000/health
curl http://localhost:5173

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo1234"}'
```

---

## Cloud Platforms

### 1. Heroku Deployment

```bash
# Create Heroku app
heroku create fraud-detection

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### 2. AWS EC2 Deployment

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance.compute.amazonaws.com

# Install dependencies
sudo yum update -y
sudo yum install -y nodejs npm mongodb-org docker

# Clone and setup
git clone https://github.com/yourusername/fraud-detection-mern.git
cd fraud-detection-mern

# Start with systemd
sudo cp deployment/fraud-detection.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable fraud-detection
sudo systemctl start fraud-detection
```

### 3. DigitalOcean App Platform

```bash
# Using App Spec
app create --spec app.yaml
```

Create `app.yaml`:
```yaml
name: fraud-detection
services:
  - name: backend
    github:
      repo: yourusername/fraud-detection-mern
      branch: main
      deploy_on_push: true
    build_command: cd backend && npm install
    run_command: npm start
    envs:
      - key: MONGO_URI
        value: ${db.connection_string}
      - key: JWT_SECRET
        scope: RUN_AND_BUILD_TIME
        value: ${JWT_SECRET}

  - name: frontend
    github:
      repo: yourusername/fraud-detection-mern
      branch: main
      deploy_on_push: true
    build_command: cd frontend && npm install && npm run build
    run_command: npm run preview

databases:
  - name: db
    engine: MONGODB
```

### 4. Railway.app Deployment

1. Connect GitHub repository
2. Create new project
3. Add MongoDB plugin
4. Set environment variables:
   - `MONGO_URI`: From MongoDB plugin
   - `JWT_SECRET`: Random 64-char string
   - `NODE_ENV`: production
5. Deploy!

---

## Kubernetes Deployment

### Prerequisites
- kubectl configured
- Kubernetes cluster (EKS, GKE, AKS, or local k3s)

### Step 1: Create Namespace

```bash
kubectl create namespace fraud-detection
kubectl config set-context --current --namespace=fraud-detection
```

### Step 2: Create ConfigMap and Secrets

```bash
# Create secret for JWT
kubectl create secret generic fraud-detection-secret \
  --from-literal=jwt-secret=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Create ConfigMap
kubectl create configmap fraud-detection-config \
  --from-literal=NODE_ENV=production \
  --from-literal=LOG_LEVEL=info
```

### Step 3: Deploy MongoDB

```bash
kubectl apply -f deployment/mongodb-statefulset.yaml
```

Create `deployment/mongodb-statefulset.yaml`:
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
  namespace: fraud-detection
spec:
  serviceName: mongodb
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:7.0
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: "admin"
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: fraud-detection-secret
              key: mongo-password
        volumeMounts:
        - name: mongo-data
          mountPath: /data/db
  volumeClaimTemplates:
  - metadata:
      name: mongo-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
```

### Step 4: Deploy Backend

```bash
kubectl apply -f deployment/backend-deployment.yaml
```

### Step 5: Deploy Frontend

```bash
kubectl apply -f deployment/frontend-deployment.yaml
```

### Step 6: Create Services

```bash
kubectl apply -f deployment/services.yaml
```

---

## Manual Server Deployment

### Prerequisites
- Ubuntu 20.04+ server
- Node.js 18+
- MongoDB 7.0+
- Nginx

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
curl https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
```

### Step 2: Deploy Application

```bash
# Clone repository
sudo mkdir -p /srv/apps
sudo chown $USER:$USER /srv/apps
cd /srv/apps
git clone https://github.com/yourusername/fraud-detection-mern.git
cd fraud-detection-mern

# Install dependencies
cd backend
npm install --production
cd ../frontend
npm install
npm run build

# Create .env
cd ../backend
cp .env.example .env
# Edit .env with production values
```

### Step 3: Setup Systemd Service

Create `/etc/systemd/system/fraud-detection.service`:
```ini
[Unit]
Description=FraudGuard Backend Service
After=network.target mongodb.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/srv/apps/fraud-detection-mern/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
EnvironmentFile=/srv/apps/fraud-detection-mern/backend/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable fraud-detection
sudo systemctl start fraud-detection
sudo systemctl status fraud-detection
```

### Step 4: Configure Nginx

Create `/etc/nginx/sites-available/fraud-detection`:
```nginx
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        root /srv/apps/fraud-detection-mern/frontend/dist;
        try_files $uri /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/fraud-detection /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Setup SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

---

## SSL/HTTPS Setup

### Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Self-Signed (Testing Only)

```bash
# Generate self-signed cert
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/privkey.pem \
  -out /etc/nginx/ssl/fullchain.pem
```

---

## Monitoring & Logs

### Application Logs

```bash
# Docker
docker-compose logs -f backend
docker-compose logs -f frontend

# Systemd
sudo journalctl -u fraud-detection -f

# File logs
tail -f backend/logs/combined.log
```

### Health Checks

```bash
# Continuous monitoring
watch 'curl -s http://localhost:5000/health | jq'

# Uptime monitoring services
# Configure monitoring.io, Pingdom, or similar
```

### Performance Monitoring

```bash
# Database stats
mongosh
> db.transactions.stats()
> db.users.stats()

# Memory usage
node --inspect
# Access chrome://inspect in Chrome DevTools
```

---

## Backup & Recovery

### Database Backup

```bash
# Backup
mongodump --uri="mongodb+srv://admin:password@cluster.mongodb.net/fraud_detection" \
  --out=/backup/mongodb

# Restore
mongorestore --uri="mongodb+srv://admin:password@cluster.mongodb.net/fraud_detection" \
  /backup/mongodb

# Schedule with cron
0 2 * * * /usr/bin/mongodump --uri="..." --out=/backup/$(date +\%Y-\%m-\%d)
```

### Application Backup

```bash
# Backup code and config
tar -czf /backup/fraud-detection-$(date +%Y-%m-%d).tar.gz \
  /srv/apps/fraud-detection-mern
```

---

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
```

**MongoDB Connection Failed**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Test connection
mongosh "mongodb://localhost:27017"
```

**Frontend Not Loading**
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Rebuild frontend
cd frontend
npm install
npm run build
```

**High Memory Usage**
```bash
# Check Node process
ps aux | grep node
top -p <PID>

# Restart service
sudo systemctl restart fraud-detection
```

---

## Production Checklist

- [ ] Set strong `JWT_SECRET` (64 characters)
- [ ] Enable HTTPS/TLS with valid certificate
- [ ] Configure firewall (allow only 80, 443)
- [ ] Set `NODE_ENV=production`
- [ ] Enable MongoDB authentication
- [ ] Setup regular database backups
- [ ] Configure CORS_ORIGIN for your domain
- [ ] Enable rate limiting
- [ ] Setup monitoring and alerting
- [ ] Enable application logging
- [ ] Configure auto-restart on failure
- [ ] Setup health check monitoring
- [ ] Document deployment process
- [ ] Test disaster recovery
- [ ] Plan scaling strategy

---

For more information, see [README.md](../README.md)
