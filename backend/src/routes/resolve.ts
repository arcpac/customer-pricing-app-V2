import { Router } from "express"
import type { Request, Response } from "express"
import { pricingProfiles } from "../data/pricingProfiles.js"
import { products } from "../data/products.js"
import { customers } from "../data/customers.js"
import { resolvePrice } from "../utils/resolver.js"

const router = Router()

router.get("/", (req: Request, res: Response) => {
  const { customerId, productId } = req.query as Record<string, string>

  if (!customerId) {
    res.status(400).json({ error: "customerId is required" })
    return
  }
  if (!productId) {
    res.status(400).json({ error: "productId is required" })
    return
  }

  const customer = customers.find((c) => c.id === customerId)
  if (!customer) {
    res.status(404).json({ error: "Customer not found" })
    return
  }

  const product = products.find((p) => p.id === productId)
  if (!product) {
    res.status(404).json({ error: "Product not found" })
    return
  }

  res.json(resolvePrice(customer, product, pricingProfiles))
})

export default router
