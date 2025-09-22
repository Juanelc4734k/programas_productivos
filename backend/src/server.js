import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;

// Server restart trigger
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));