import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = "onboarding@resend.dev";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: "Traders Institute Academy — Reset Your Password",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f0f; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
        <h2 style="color: #C9A84C; margin: 0 0 16px; font-size: 20px;">Password Reset</h2>
        <p style="color: #ccc; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          You requested a password reset for your Traders Institute Academy account. Click the button below to set a new password. This link expires in 1 hour.
        </p>
        <a href="${resetLink}" style="display: inline-block; background: #C9A84C; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">Reset Password</a>
        <p style="color: #555; font-size: 12px; margin: 24px 0 0;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: fromEmail,
    to,
    subject: "Welcome to Traders Institute Academy",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f0f; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
        <h2 style="color: #C9A84C; margin: 0 0 16px; font-size: 20px;">Welcome, ${name}!</h2>
        <p style="color: #ccc; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Your account has been created at Traders Institute Academy. You can now access your courses and start learning.
        </p>
        <a href="${frontendUrl}/dashboard" style="display: inline-block; background: #C9A84C; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">Go to Dashboard</a>
        <p style="color: #555; font-size: 12px; margin: 24px 0 0;">
          Login with the credentials provided by your administrator.
        </p>
      </div>
    `,
  });
}

export async function sendAccessGrantedEmail(to: string, name: string, courseName: string) {
  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Access Granted — ${courseName}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f0f; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
        <h2 style="color: #C9A84C; margin: 0 0 16px; font-size: 20px;">Course Access Granted</h2>
        <p style="color: #ccc; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Hi ${name}, you now have access to <strong style="color: #C9A84C;">${courseName}</strong>. Start learning today!
        </p>
        <a href="${frontendUrl}/dashboard" style="display: inline-block; background: #C9A84C; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">Go to Course</a>
      </div>
    `,
  });
}
