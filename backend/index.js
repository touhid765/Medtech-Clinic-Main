import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./db/connectDb.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";  // Import cors
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';


// CORS configuration
app.use(cors({
    origin: origin, // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers)
}));

app.use(express.json()); // Allows input from req.body
app.use(cookieParser()); // Parses incoming cookies

app.use("/api/auth", authRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/build")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
	});
}

app.listen(PORT, () => {
    connectDb();
    console.log("Server is running on port:", PORT);
});
