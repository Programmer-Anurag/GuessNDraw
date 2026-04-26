import mongoose from "mongoose";


export const connectDB = async () => {
  // console.log(process.env.MONGO_URL);
  await mongoose.connect(process.env.MONGO_URL);
  console.log("db connected");
  
};