

// await mysql_db.execute('create database mysql_db');
//  console.log(await mysql_db.execute("show databases"));
// await mysql_db.execute(`
//     CREATE TABLE complaintable(
// id INT AUTO_INCREMENT PRIMARY KEY,
// complain_id VARCHAR(40) NOT NULL UNIQUE,
// complain_category VARCHAR(60),
// complain_detalis TEXT NOT NULL,
// email VARCHAR(100) NOT NULL,
// evidence VARCHAR(300),
// status ENUM('Received','In Review','Resolved')DEFAULT 'Received',
// created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );`
// )
// await mysql_db.execute(`insert into complaintable(id,complain_id,complain_detalis,email) values(2,5,'sakshi@gag','incident in bit')`);
// const rows=await mysql_db.execute(`select * from complaintable`);
// console.log(rows);
import { v4 as uuidv4 } from "uuid";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import multer from "multer";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });


const mysql_db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "vidhigarg",
  database: "mysql_db",
});
console.log("Connected to MySQL successfully!");


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/create.html"));
});
import cors from "cors";
import dotenv from "dotenv";
import { askAgora } from "./agoraai.js";
dotenv.config();

app.post("/submit", upload.single("evidence"), async (req, res) => {
  const { email, complain_details } = req.body;
  let { complain_category } = req.body;
  let evidenceFile = req.file ? req.file.filename : null;

  if (!email || !complain_details) {
    return res.send("❌ Email and complaint details are required.");
  }
  if (!complain_category) complain_category = null;

  try {
    const complain_id = uuidv4();
    const status = "Received";
    const now = new Date();
    const incident_date = now.toISOString().slice(0, 10);
    const incident_time = now.toISOString().slice(11, 19);
    const aiResult = await askAgora(complain_details);
const aiResponseText = aiResult?.choices?.[0]?.message?.content || "AI could not analyze complaint.";

const summary = aiResponseText;
const urgency = "low"; // Just keep default for now
    // Insert into database
    const sql = `
      INSERT INTO complaintable
      (complain_id, complain_category, complain_detalis, email, evidence, status, urgency, incident_date, incident_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await mysql_db.execute(sql, [
      complain_id,
      complain_category,
      complain_details,
      email,
      evidenceFile,
      status,
      urgency,
      incident_date,
      incident_time,
    ]);

    console.log("✅ Complaint saved successfully!");
    res.json({
      message: "Complaint submitted successfully!",
      urgency,
      summary,
    });
  } catch (err) {
    console.error("❌ Error inserting data:", err);
    res.status(500).send("❌ Error while saving complaint. Check backend console.");
  }
});
//end
app.post("/submit-complaint", async (req, res) => {
  try {
    const { complaint_text } = req.body;

    // Send complaint to Agora AI
    const aiResult = await analyzeComplaint(complaint_text);

    res.json({
      message: "Complaint received successfully!",
      aiAnalysis: aiResult, // urgency, summary, etc.
    });
  } catch (error) {
    console.error("Error analyzing complaint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   console.log(`🚀 Server started on http://localhost:${PORT}`);
});
