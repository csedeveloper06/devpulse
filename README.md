# 🚀 DevPulse

DevPulse is a community-driven issue tracking and project collaboration platform where users can report issues, contribute solutions, and manage project workflows efficiently.

## 🌐 Live Demo

[![GitHub](https://img.shields.io/badge/GitHub_Repository-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://github.com/csedeveloper06/devpulse)
[![Backend](https://img.shields.io/badge/Backend_Live_Link-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://express-postgresql-devpulse.vercel.app/)
[![Video](https://img.shields.io/badge/Interview_Video-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/)

## ✨ Key Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Secure password hashing with bcrypt
- Role-based access control
- Protected routes

### 🐛 Issue Management

- Issue related CRUD operations
- Concurrent issue validations
- Beginner friendly challenges like sorting, filtering

### 👥 User Management

- User related CRUD operations
- User registration
- User login
- Contributor and Maintainer roles

### ⚡ Advanced Features

- Global error handling
- Request validation
- Filtering and sorting
- Clean modular architecture

### 🛠️ Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Raw SQL
- bcrypt
- jsonwebtoken

## 📡 API Endpoints

#### 🔐 Authentication

```http
  http://localhost:5000
```

| Method | Endpoint                | Description               |
| :----- | :---------------------- | :------------------------ |
| POST   | /api/auth/register      | Register User             |
| POST   | /api/auth/login         | Login User                |
| POST   | /api/auth/refresh-token | Generate New Access Token |

#### 👤 Users

```http
  http://localhost:5000
```

| Method | EndPoint       | Description     |
| :----- | :------------- | :-------------- |
| GET    | /api/users     | Get All Users   |
| GET    | /api/users/:id | Get Single User |
| PATCH  | /api/users/:id | Update User     |
| DELETE | /api/users/:id | Delete User     |

### 🐛 Issues

```http
  http://localhost:5000
```

| Method | EndPoint        | Description      |
| :----- | :-------------- | :--------------- |
| POST   | /api/issues     | Create Issue     |
| GET    | /api/issues     | Get All Issues   |
| GET    | /api/issues/:id | Get Single Issue |
| PATCH  | /api/issues/:id | Update Issue     |
| DELETE | /api/issues/:id | Delete Issue     |

## 🗄️ Database Schema Summary

### 👤 User Model

| Field      | Type     |
| :--------- | :------- |
| id         | Serial   |
| name       | String   |
| email      | String   |
| password   | String   |
| role       | Enum     |
| created_at | DateTime |
| updated_at | DateTime |

### 🐛 Issue Model

| Field       | Type     |
| :---------- | :------- |
| id          | Serial   |
| title       | String   |
| description | Text     |
| type        | Enum     |
| status      | Enum     |
| reporter_id | Int      |
| created_at  | DateTime |
| updated_at  | DateTime |

## 🛡️ Error Handling

- The application uses centralized error handling middleware to ensure consistent responses.

## Example Response

```javascript
{ "success": false, "message": "Validation Error", "errors": error }
```
