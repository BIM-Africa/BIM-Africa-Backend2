// ✅ Cloudflare Workers + MongoDB (fixed version)
import { MongoClient } from 'mongodb'
import allRoutes from './routes/index.js'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/connectDB.js'

const app = express()

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB()
// ✅ Simple root route
app.get('/', (req, res) => res.send('✅ Server running on Cloudflare Workers!'))

app.use("/api", allRoutes)
// CONTACT Endpoint

const verifyCaptcha = async (token) => {
  try {
    const secretKey = "6LcPmRgsAAAAAG46D5YNVofHmFbD3kZoH78dVeBg"; // your SECRET key

    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: "POST" }
    );

    const data = await response.json();

    // Return ONLY true if human
    return data.success === true && data.score >= 0.3;
  } catch (err) {
    console.error("Captcha verify error:", err);
    return false;
  }
};

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message, captchaToken } = req.body;

    const human = await verifyCaptcha(captchaToken);
    if (!human) {
      return res.status(400).json({ error: "Captcha failed. Try again." });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 3000');
})

// ✅ Export the app (Cloudflare entry point)
export default app
