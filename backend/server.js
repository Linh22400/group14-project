// backend/server.js
const express = require('express');
const cors = require('cors');

const app = express();

// CORS middleware
app.use(cors());
app.use(express.json());

// import router đúng cách
const userRoutes = require('./routes/user');

// gắn router vào /api
app.use('/api', userRoutes);

// endpoint test
app.get('/', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
