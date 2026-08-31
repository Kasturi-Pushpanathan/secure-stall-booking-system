# 📚 Book Fair Management System (Full-Stack Distributed System with AI & Real-Time Features)

![Java](https://img.shields.io/badge/Java-17+-red.svg)
![Spring Boot](https://img.shields.io/badge/SpringBoot-Backend-green.svg)
![React](https://img.shields.io/badge/React-Frontend-blue.svg)
![JWT](https://img.shields.io/badge/Auth-JWT-orange.svg)
![WebSockets](https://img.shields.io/badge/Realtime-WebSockets-purple.svg)
![MySQL](https://img.shields.io/badge/Database-MySQL-blue.svg)
![FastAPI](https://img.shields.io/badge/AI-FastAPI-lightgrey.svg)
![Machine Learning](https://img.shields.io/badge/ML-RandomForest-yellow.svg)
![Microservices](https://img.shields.io/badge/Architecture-Distributed-brightgreen.svg)

---

# 📖 Overview

Book Fair Management System is a full-stack distributed platform designed to manage large-scale book fair events with real-time booking, AI recommendations, and secure authentication.

It integrates multiple technologies:

- Frontend: React.js  
- Backend: Spring Boot (REST + WebSockets)  
- Database: MySQL  
- AI Service: FastAPI (Machine Learning)  
- Security: Spring Security + JWT  
- Communication: WebSockets (STOMP)

The system enables vendors to book stalls efficiently while preventing conflicts and improving decision-making using AI.

---

# 🎯 Problem Statement

Traditional book fair management suffers from:

- Double booking of stalls  
- Lack of real-time updates  
- Manual stall allocation  
- Poor optimization of space usage  
- No intelligent recommendation system  

This system solves these problems by introducing:

- Real-time stall synchronization  
- Centralized booking system  
- AI-based genre recommendation  
- Secure role-based authentication  
- Scalable microservice architecture  

---

# 🚀 Key Features

## 🔐 Authentication System

- JWT-based stateless authentication  
- Role-based access: ADMIN, VENDOR  
- BCrypt password encryption  
- Secure REST API protection  

---

## 🏪 Reservation System

- Multi-stall booking support  
- Advance payment (10%)  
- Booking lifecycle management:
  - PENDING  
  - SUCCESS  
  - CANCELLED  
  - REFUNDED  

---

## 🎪 Event Management

Admins can:

- Create book fair events  
- Configure stall layouts  
- Set stall pricing  
- Block/unblock stalls dynamically  

---

## ⚡ Real-Time System

- WebSocket (STOMP + SockJS)  
- Live stall availability updates  
- Prevents double booking  
- Instant UI synchronization  

---

## 🤖 AI Recommendation Engine

Machine Learning system suggests optimal book genres.

Model:
- Random Forest Classifier

Input Features:
- Stall X coordinate  
- Stall Y coordinate  
- Stall size encoding  
- Distance from entrance  

Output:
- Top 3 recommended genres  

---

# 🏗️ System Architecture

```text
React Frontend
      │ (JWT REST API)
      ▼
Spring Boot Backend
      │
      ├── MySQL Database
      │
      ├── WebSocket Broker (STOMP)
      │
      ▼
FastAPI ML Service (Random Forest Model)
```

---

# 🔄 System Workflow

## Authentication Flow

```text
Login Request
     ↓
JWT Token Generated
     ↓
Client stores token
     ↓
JwtAuthFilter validates request
     ↓
Access granted based on role
```

## Reservation Flow

```text
User selects stalls
      ↓
Backend validates availability
      ↓
Reservation created
      ↓
WebSocket event triggered
      ↓
Frontend updates instantly
```

## AI Recommendation Flow

```text
Stall selection
      ↓
Feature extraction
      ↓
FastAPI request
      ↓
Random Forest prediction
      ↓
Top 3 genres returned
```

---

# 📂 Project Structure

```bash
Book-Fair-Management-System/
│
├── backend/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   ├── security/
│   └── websocket/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── services/
│
├── ml-service/
│   ├── model.pkl
│   ├── train.py
│   └── main.py
│
├── database/
├── README.md
└── pom.xml
```

---

# 🧠 Database Design

```text
USER ───< RESERVATION >─── EVENT
              │
              ├── RESERVATION_STALL ─── STALL
              │
              ├── RESERVATION_GENRE ─── GENRE
              │
              └── PAYMENT
```

---

# 🔌 API DESIGN

## Auth APIs

| Endpoint                  | Method | Description       |
| ------------------------- | ------ | ----------------- |
| /api/auth/login           | POST   | User login        |
| /api/auth/register        | POST   | User registration |
| /api/auth/forgot-password | POST   | Reset password    |

## Event APIs

| Endpoint          | Method | Description  |
| ----------------- | ------ | ------------ |
| /api/events       | GET    | Get events   |
| /api/admin/events | POST   | Create event |

## Reservation APIs

| Endpoint                      | Method | Description     |
| ----------------------------- | ------ | --------------- |
| /api/reservations/book        | POST   | Book stalls     |
| /api/reservations/my          | GET    | My reservations |
| /api/reservations/{id}/cancel | POST   | Cancel booking  |

## AI API

| Endpoint        | Method | Description       |
| --------------- | ------ | ----------------- |
| /predict-genres | POST   | ML recommendation |

---

# ⚡ Real-Time Features

- Live stall updates via WebSockets  
- Instant booking synchronization  
- Prevents race conditions  
- Topic-based messaging system  

---

# 🔐 Security Design

- JWT Authentication (Stateless)  
- Role-based Authorization  
- BCrypt Password Hashing  
- CORS Configuration  
- Spring Security Filter Chain  

---

# 🧠 MACHINE LEARNING PIPELINE

```text
Data Collection
      ↓
Feature Engineering
      ↓
Model Training (Random Forest)
      ↓
Model Serialization
      ↓
FastAPI Deployment
      ↓
Prediction API
```

---

# 🐳 DEPLOYMENT ARCHITECTURE

```text
Frontend  → React
Backend   → Spring Boot
ML Service→ FastAPI
Database  → MySQL
WebSocket → STOMP Broker
```

---

# ☁️ DEPLOYMENT FLOW

```text
GitHub Repository
      ↓
CI/CD Pipeline
      ↓
Spring Boot Server
      ↓
React Hosting
      ↓
FastAPI Service
      ↓
MySQL Database
```

---

# 📈 FUTURE ENHANCEMENTS

- Payment gateway integration (Stripe/PayPal)  
- Docker containerization  
- Kubernetes deployment  
- Mobile app (React Native)  
- AI demand forecasting  
- Deep learning recommendation model  
- Admin analytics dashboard  

---

# 🧪 HOW TO RUN PROJECT

## Backend

```bash
mvn spring-boot:run
```

## Frontend

```bash
npm install
npm start
```

## ML Service

```bash
uvicorn main:app --reload --port 8003
```

# 🎓 Academic Project Information

## Module
**SENG 22212 – Software Architecture and Design**

This project was developed as a **group assignment** for the SENG 22212 module in the Software Engineering degree program.

The objective of this project is to apply software architecture principles, distributed system design, microservices concepts, and modern full-stack development practices to build a scalable real-world system.

---

# 👨‍💻 Team Contribution

This project was developed by a **team of 5 members**, where each member contributed to different layers of the system:  
  member 1 - P.Kasturi    
  member 2 - S.Krishnapiriyan    
  member 3 - V.Vanushan  
  member 4 - T.Harishlan   
  member 5 - V.Khaviya    
  member 5 - K.Kajaluxmy  


---
