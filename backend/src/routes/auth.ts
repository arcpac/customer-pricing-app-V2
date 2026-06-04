import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { PrismaClient } from "../generated/prisma/client.js"

const router = Router()
const prisma = new PrismaClient()

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 10 * 60 * 1000,
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  console.log('req.body', req.body)
  if (!email || !password) {
    res.status(400).json({ error: "email and password required" })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "invalid credentials" })
    return
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "10m" })
  res.cookie("token", token, COOKIE_OPTS)
  res.json({ email: user.email })
})

router.post("/logout", (_req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" })
  res.json({ ok: true })
})

router.get("/me", (req, res) => {
  const token = (req.cookies as Record<string, string>)?.token
  if (!token) { res.status(401).json({ error: "unauthenticated" }); return }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string }
    res.json({ userId: payload.userId, email: payload.email })
  } catch {
    res.status(401).json({ error: "unauthenticated" })
  }
})

export default router
