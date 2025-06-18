const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./routes/authRoutes');
const submissionRouter = require('./routes/submissionRoutes');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5174',
  'https://resume-frontend-nu-red.vercel.app/' // Replace with your actual Vercel frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('connected to mongodb...'))
    .catch((err) => console.log(err));

app.use('/api/auth', authRouter);
app.use('/api/submissions', submissionRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});


