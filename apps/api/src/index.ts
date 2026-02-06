import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4000;

import convertRouter from "./routes/convert";

app.use(cors());
app.use(express.json());

app.use("/convert", convertRouter);

app.get("/", (req, res) => {
  res.json({ message: "PDF Utility API is running" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
