import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

function getEncodedKey() {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET environment variable is required")
  }
  return new TextEncoder().encode(secret)
}

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedKey())
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, getEncodedKey(), {
      clockTolerance: 60,
    })
    return payload
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(userId: string, email: string, role: string) {
  const token = await encrypt({ userId, email, role })
  const cookieStore = cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    domain: process.env.NODE_ENV === "production" ? `.${process.env.MAIN_DOMAIN || "cavree.com"}` : undefined,
  })
  return token
}

export async function getSession() {
  const cookieStore = cookies()
  const session = cookieStore.get("session")?.value
  if (!session) return null
  return await decrypt(session)
}

export async function deleteSession() {
  const cookieStore = cookies()
  cookieStore.delete("session")
}

export async function createResetToken(userId: string) {
  return new SignJWT({ userId, purpose: "reset-password" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getEncodedKey())
}

export async function verifyResetToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), { clockTolerance: 60 })
    if (payload.purpose !== "reset-password" || !payload.userId) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export async function requireAuth(allowedRoles?: string[]) {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  if (allowedRoles && !allowedRoles.includes(session.role as string)) {
    throw new Error("Forbidden")
  }
  return session
}
