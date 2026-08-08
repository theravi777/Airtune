# Airtune

Airtune is a full-stack music platform where listeners discover music and artists can upload original audio and publish albums.

## Stack

- Frontend: semantic HTML, responsive CSS, vanilla JavaScript
- Backend: Node.js, Express, express-validator, JWT authentication, Multer
- Data and media: MongoDB/Mongoose and ImageKit

## Run locally

1. In `Backend`, create a `.env` file with `MONGO_URI`, `JWT_SECRET`, and `IMAGEKIT_PRIVATE_KEY`.
2. Run `node server.js` from the `Backend` directory.
3. Open `http://localhost:3000`.

The Express server serves the frontend directly, so there is no separate frontend server to configure.

## Key features

- Register and log in as a listener or artist
- Cookie-based JWT-protected API requests
- Request validation middleware for registration and login credentials
- Browse tracks and albums retrieved from the backend
- Play uploaded audio in the in-browser player
- Artist studio for audio upload and album creation
- Responsive, original interface designed for desktop and mobile

## Resume description

**Airtune — Full-Stack Music Platform** · Built a responsive music discovery platform using HTML, CSS, JavaScript, Node.js, Express, MongoDB, JWT authentication, Multer, and ImageKit. Implemented role-based listener/artist accounts, secure cookie sessions, music uploads, album creation, and live REST API integration.
