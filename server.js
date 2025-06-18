const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./routes/authRoutes');
const submissionRouter = require('./routes/submissionRoutes');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5174',
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


