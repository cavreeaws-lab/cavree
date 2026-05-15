import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"

const sesClient = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  ? new SESClient({
      region: process.env.AWS_REGION || "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null

const fromEmail = process.env.FROM_EMAIL || "noreply@cavree.com"

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text?: string }) {
  if (!sesClient) {
    console.log("[EMAIL MOCK] To:", to, "Subject:", subject)
    console.log("[EMAIL MOCK] Text:", text || "")
    return { messageId: "mock-message-id" }
  }

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: html },
        Text: { Data: text || html.replace(/<[^>]*>/g, "") },
      },
    },
  })

  return await sesClient.send(command)
}

export async function sendPasswordResetEmail({ to, resetUrl }: { to: string; resetUrl: string }) {
  const subject = "Reset your Cavree password"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You requested to reset your password for your Cavree account.</p>
      <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
      <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
    </div>
  `
  return sendEmail({ to, subject, html })
}

export async function sendOrderConfirmationEmail({ to, orderNumber, total }: { to: string; orderNumber: string; total: number }) {
  const subject = `Order Confirmation - ${orderNumber}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Thank you for your order!</h2>
      <p>Your order <strong>${orderNumber}</strong> has been placed successfully.</p>
      <p>Total: <strong>₹${total.toLocaleString("en-IN")}</strong></p>
      <p>You can view your order details by logging into your account.</p>
    </div>
  `
  return sendEmail({ to, subject, html })
}
