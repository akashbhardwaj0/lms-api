import mongoose from "mongoose";

// mongodb connection
const connectDb = async () => {
  mongoose.connection.on("Connected", () => console.log("DataBase Connected"));
  await mongoose.connect(`${process.env.MONGODB_URI}/lms`);
};

export default connectDb;
