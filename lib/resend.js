import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@GigForge.com",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email send error:", err);
  }
}

export function bidReceivedEmail(clientName, projectTitle, developerName, bidAmount) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2>New Bid Received on "${projectTitle}"</h2>
      <p>Hi ${clientName},</p>
      <p><strong>${developerName}</strong> has submitted a bid of <strong>$${bidAmount}</strong> on your project.</p>
      <p>Log in to review the bid and proposal.</p>
    </div>
  `;
}

export function bidAcceptedEmail(developerName, projectTitle, amount) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2>Your Bid Was Accepted! 🎉</h2>
      <p>Hi ${developerName},</p>
      <p>Your bid of <strong>$${amount}</strong> on <strong>"${projectTitle}"</strong> has been accepted.</p>
      <p>The client will fund the escrow shortly and you can begin work.</p>
    </div>
  `;
}
