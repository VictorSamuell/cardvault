import express from "express"
import cors from "cors"
import cardsRoutes from "./routes/cards.routes.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api", cardsRoutes)

app.get("/", (req, res) => {
  res.json({ message: "CardVault API running" })
})

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})