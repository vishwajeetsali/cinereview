# CineReview 🎬

[![CI / CD Pipeline](https://github.com/vishwajeetsali/cinereview/actions/workflows/ci.yml/badge.svg)](https://github.com/vishwajeetsali/cinereview/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)

A full-stack, real-time movie review and discovery platform powered by TMDB metadata, Groq AI sentiment analysis, and Upstash Redis caching. Fully containerized with multi-stage Docker builds, unprivileged non-root runtime security, and automated CI/CD.

---

## ⚡ Quickstart with Docker Compose

Run the entire full-stack application (Frontend + Backend) with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/vishwajeetsali/cinereview.git
cd cinereview

# 2. Start the multi-container stack
docker compose up -d --build

# 3. View live logs
docker compose logs -f
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

To shut down the stack cleanly:
```bash
docker compose down
```

---

## 🏗️ Architecture

```mermaid
flowchart TD
    User["Client Browser (http://localhost:3000)"]
    
    subgraph Docker_Network["Docker Bridge Network"]
        subgraph Frontend["Frontend Container (Port 80)"]
            Nginx["Nginx:alpine (29 MB)\nStatic Asset Server + SPA Router (try_files)"]
        end

        subgraph Backend["Backend Container (Port 5000)"]
            Express["Node.js 22 + Express 5\nUnprivileged user: node\nHealth Check: wget / every 10s"]
        end
    end

    subgraph Cloud_Services["External Cloud & Persistence"]
        TMDB["TMDB Movie API"]
        Groq["Groq AI Sentiment Analysis"]
        MongoAtlas["MongoDB Atlas Cluster"]
        Upstash["Upstash Redis Cache"]
        Cloudinary["Cloudinary Media CDN"]
    end

    User -->|"Port 3000 -> 80"| Nginx
    User -->|"Port 5000 -> 5000"| Express
    Express --> TMDB
    Express --> Groq
    Express --> MongoAtlas
    Express --> Upstash
    Express --> Cloudinary
```

---

## 🛡️ DevOps & Engineering Highlights

- **Multi-Stage Docker Builds:** Optimized frontend image from ~500 MB down to **29 MB** by using a temporary Node.js 22 builder and a razor-thin Alpine Nginx runtime.
- **Principle of Least Privilege:** Backend container drops `root` permissions and runs strictly under the unprivileged `USER node` (UID 1000).
- **SPA Route Resilience:** Configured Nginx with `try_files $uri $uri/ /index.html;` to eliminate 404 errors on browser client-side routing refreshes.
- **Automated Health Checks:** Express backend exposes an automated HTTP health check probe monitored by Docker engine with automatic retry policies.
- **CI/CD Automation:** Automated GitHub Actions pipeline validating 49 unit/security tests, TypeScript compilation, and multi-stage Docker build integrity on every push and pull request.

---

## 🧪 Testing

The test suite contains 49 automated tests spanning defensive security and end-to-end user journeys:

```bash
# Run backend security & unit tests
cd server
npm test
```
