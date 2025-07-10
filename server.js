require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');


app.use(cors());
app.use(express.json());
console.log('JWT_SECRET from env:', process.env.JWT_SECRET);


const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const deployRoute = require('./routes/deployRoute');
const linksRoute = require('./routes/links');


app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/deploy', deployRoute);
app.use('/api/links', linksRoute);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🟢 MongoDB Connected'))
  .catch(err => console.log('❌ Mongo Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
