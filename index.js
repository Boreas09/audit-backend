import express from "express";
import { dbConnect } from "./db/mongoDatabase.js";
import { initDatabase } from "./db/sqlDatabase.js";
import "./utils/loadEnvironment.js";
import auditController from "./api/auditController.js";
import userController from "./api/userController.js";
import commentController from "./api/commentController.js";
import companyController from "./api/companyController.js";
import scopeController from "./api/scopeController.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware to log HTTP methods and URLs
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} request to ${req.url}`);
  next(); // Pass control to the next middleware
});

app.use(cors());
app.use(express.json()); // Middleware to parse JSON

app.get("/", (req, res) => {
  res.send("Welcome to the Audit Backend API!");
});

// Define routes
app.use("/audit", auditController);
app.use("/user", userController);
app.use("/comment", commentController);
app.use("/company", companyController);
app.use("/scope", scopeController);

app.listen(PORT, async () => {
  await dbConnect();
  await initDatabase();
  console.log(`Server is listening on port ${PORT}`);
});
