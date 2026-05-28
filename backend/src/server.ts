import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import swaggerUi from "swagger-ui-express"
import productsRouter from "./routes/products.js"
import customersRouter from "./routes/customers.js"
import customerGroupsRouter from "./routes/customerGroups.js"
import pricingProfilesRouter from "./routes/pricingProfiles.js"
import resolveRouter from "./routes/resolve.js"
import { swaggerSpec } from "./swagger.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is running" })
})

app.use("/api/products", productsRouter)
app.use("/api/customers", customersRouter)
app.use("/api/customer-groups", customerGroupsRouter)
app.use("/api/pricing-profiles", pricingProfilesRouter)
app.use("/api/resolve", resolveRouter)

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})