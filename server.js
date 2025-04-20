import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDb from "./configs/mongodb.js";
import { userController } from "./controllers/userController.js";
import educatorRouter from "./routes/educatorRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/cloudinary.js";

const app = express();

// middware
app.use(cors());
// app.use(clerkMiddleware());

// connect to database
await connectDb();
await connectCloudinary();

// routes
app.get("/", (req, res) => {
  res.send("API is Working");
});

// app.post("/user", express.json(), userController);
app.use("/api/educator", express.json(), educatorRouter);

// port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server is running on port: " + PORT));
