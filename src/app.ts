import "reflect-metadata";
import express from "express";
import { errorHandler } from "./utils/handleError";
import session from "express-session";
import "./di/container";
import authRoutes from "./routes/auth/authRoutes";
import cors from "cors";
import { corsOptions } from "./config/corsConfig";
import { mongoSessionStoreConfig } from "./config/mongoSession";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user/userRoutes";
import adminRoutes from "./routes/admin/adminRoutes";
import notificationRoute from './routes/notification/NotificationRoute'

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET is not defined in environment variables.");
}
const app = express();

app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: mongoSessionStoreConfig,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 2 * 60 * 1000,
      sameSite:'none'
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/notification',notificationRoute)

app.use(errorHandler);

export default app;
