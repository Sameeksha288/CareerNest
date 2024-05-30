import express from 'express';
import { register, login, logout, getUser } from '../controllers/userController.js'; 
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);  //if the user doesnt have token then it will get authorization error
router.get("/getUser", isAuthenticated, getUser); 

export default router;