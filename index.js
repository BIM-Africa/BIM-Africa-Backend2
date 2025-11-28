// ✅ Cloudflare Workers + MongoDB (fixed version)
import { MongoClient } from 'mongodb'
import allRoutes from './routes/index.js'
import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())

// ✅ Simple root route
app.get('/', (req, res) => res.send('✅ Server running on Cloudflare Workers!'))


app.use("/api", allRoutes)
// CONTACT Endpoint
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


// ✅ Export the app (Cloudflare entry point)
export default app
