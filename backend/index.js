const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./src/routes/userRoutes');
const cors = require('cors');

mongoose.connect('mongodb://localhost:27017/easyride')
  .then(() => console.log('MongoDB connected to easyride'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/users', userRoutes);

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
