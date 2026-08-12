const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const musicRoutes = require('./routes/music.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
app.use(express.json());
app.use(cookieParser());



app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/admin', adminRoutes);
app.use(express.static(path.join(__dirname, '../../Frontend')));

app.get('*splat', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '../../Frontend/index.html'));
});

// Keep API failures JSON-shaped so the frontend can display useful feedback.
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }

  if (err?.code === 11000) {
    return res.status(409).json({ message: 'That username or email is already in use.' });
  }

  return res.status(err.status || 500).json({
    message: err.message || 'The server could not complete that request.',
  });
});


module.exports = app;
