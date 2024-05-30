import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; //connects backend with frontend
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import userRouter from './routes/userRouter.js';
import applicationRouter from './routes/applicationRouter.js';
import jobRouter from './routes/jobRouter.js';
import {dbConnection} from './database/dbConnection.js';
import { errorMiddleWare } from "./middlewares/error.js";

const app = express();
dotenv.config({path: './config/config.env'});

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    method: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
    optionSuccessStatus: 200,
  })
);

app.use(cookieParser()); //authorization
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/application', applicationRouter);
app.use('/api/v1/job', jobRouter);

dbConnection();

app.use(errorMiddleWare);

export default app;