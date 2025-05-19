import express from "express";
import { getUserData, login, purchaseCourse, signup, userEnrolledCourses } from "../controllers/userController.js";
import { protectUser } from "../middlewares/authMiddleware.js";

const userRouter = express.Router()

userRouter.post("/register", signup)
userRouter.post("/login", login)

userRouter.get("/data",protectUser, getUserData)
userRouter.get('/enrolled-courses', protectUser, userEnrolledCourses)
userRouter.post('/purchase', protectUser, purchaseCourse)

export default userRouter