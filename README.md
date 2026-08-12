# 🎵 Airtune

A full-stack music streaming platform built with JavaScript, Node.js, Express.js, and MongoDB. Airtune provides secure user authentication, music and album management, protected API routes, cloud-based media storage, and an admin-controlled artist approval system where users can request artist access and admins can approve or reject requests.

## 🚀 Live Demo

🔗 **[Airtune - Live Demo](https://airtune-backend.onrender.com)**

## 🚀 Features

- 🔐 JWT-based user authentication
- 👤 User registration and login
- 👥 Role-based access control
- 🛡️ Protected routes using authentication middleware
- 👨‍💼 Admin-controlled artist approval system
- 📝 Artist access requests after registration
- ✅ Admin approval or rejection of artist requests
- 🎵 Music management for approved artists
- 💿 Album management
- ✅ Request validation middleware
- 🗄️ MongoDB database integration using Mongoose
- ☁️ Cloud-based media storage
- 🔌 RESTful API architecture
- 🎨 Responsive music streaming interface

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Axios

### Backend
- Node.js
- Express.js
- JWT
- REST APIs

### Database
- MongoDB
- Mongoose

### Cloud Storage
- ImageKit

### Tools
- Git
- GitHub
- VS Code
- Postman

## 📁 Project Structure

```text
Airtune/
│
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── package.json
│   └── server.js
│
├── Frontend/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── album.css
│
├── .gitignore
└── README.md
