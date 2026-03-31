import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connect_db } from "./services/database.js";



const app = express();


app.use(morgan("dev"));
app.use(cors());


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  connect_db();
});


