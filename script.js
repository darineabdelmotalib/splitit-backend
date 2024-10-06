import express from "express"
import dotenv from "dotenv"
import cors from "cors";

import calculate from "./routes/calculate.js";

dotenv.config();
const app = express();



//MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 1234;

app.use("/calculate", calculate);

app.listen(PORT, () => {
    console.log("Server running at:", PORT);
});
