const express = require('express');
const config = require('./common/config/env.config.js');
const Router = require('./routes.config');

const app = express();
const PORT = 3603;

// Middleware to parse incoming image data
app.use(express.raw({ type: 'image/jpeg', limit: '1000mb' }));

app.use((req, res, next) => {
    req.setTimeout(600000); // 5 minutes
    res.setTimeout(600000); // 5 minutes
    next();
});

// Middleware to log requests and their interaction time
app.use(function(req, res, next) {
  const startTime = new Date().getTime();
  const logEntry = {
    timestamp: new Date(),
    method: req.method,
    path: req.path,
    queryParams: req.query,
    body: req.body,
    headers: req.headers
  };

  res.on('finish', () => {
    const endTime = new Date().getTime();
    const interactionTime = endTime - startTime;
    logEntry.interactionTime = interactionTime;
    //console.log('Request Log:', logEntry);
  });

  next();
});

// CORS middleware
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Length');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  } else {
    return next();
  }
});

app.use(express.json());
Router.routesConfig(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
