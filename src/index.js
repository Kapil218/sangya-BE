import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import express from "express"; 
import connectDB from "./db/index.js";

const app = express();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`\nServer is running at port: ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!!", err);
  });
