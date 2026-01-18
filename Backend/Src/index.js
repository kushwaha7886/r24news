import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

import connectDB from "./db/ConnectDb.js";
import { app } from "./app.js";

connectDB() // Connect to MongoDB database
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port : ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
