import express from 'express';
import routes from '../routes/index.js';
import ErrorHandler from '../middlewires/error.js';
import cors from 'cors';


const app = express();

app.use(cors({
  origin: ['https://x0s6164s-5173.asse.devtunnels.ms', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://192.168.100.39:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(routes);
app.use(ErrorHandler);

export default app;