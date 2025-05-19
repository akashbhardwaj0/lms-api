import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDb from "./configs/mongodb.js";
import educatorRouter from "./routes/educatorRoutes.js";

import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import { stripWebhooks } from "./controllers/webhooks.js";
import { protectUser } from "./middlewares/authMiddleware.js";

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
app.use("/api/user", express.json(), userRouter)
app.use("/api/educator", express.json(), educatorRouter);
app.use("/api/course", express.json(), courseRouter);
app.post("/stripe", express.raw({ type: "application/json"}),protectUser, stripWebhooks)

// port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server is running on port: " + PORT));

export default app;
