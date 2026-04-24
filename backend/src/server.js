import "dotenv/config"
import dns from "dns"
dns.setDefaultResultOrder("ipv4first")
dns.setServers(["8.8.8.8", "8.8.4.4"])

import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import cardsRoutes from "./routes/cards.routes.js"
import authRoutes from "./routes/auth.routes.js"
import setsRoutes from "./routes/sets.routes.js"
import collectionRoutes from "./routes/collection.routes.js"

const app = express()
app.use(cors())
app.use(express.json())

app.get("/favicon.ico", (req, res) => res.status(204).end())
app.use("/api/auth", authRoutes)
app.use("/api", cardsRoutes)
app.use("/api", setsRoutes)
app.use("/api", collectionRoutes)

app.get("/", (req, res) => res.json({ message: "CardVault API running" }))

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB conectado!")
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Servidor rodando na porta ${process.env.PORT || 3000}`)
    })
  })
  .catch((err) => {
    console.error("Erro ao conectar no MongoDB:", err)
    process.exit(1)
  })