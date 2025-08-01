import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import CORS from 'cors';
import authRoutes from './routes/auth.route.js';
import connectDB from './lib/db.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';
import path from 'path'

const app = express();
dotenv.config();

const __dirname = path.resolve();

app.use(CORS({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true}));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);


if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'dist'/ 'index.html'));
  });
}


app.listen(process.env.PORT || 5005, () => {
    console.log(`server is running on port ${process.env.PORT}`);
    connectDB(process.env.DB_URL);
})