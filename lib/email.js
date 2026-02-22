import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "noreply@freelancemarketplace.com";

export async function sendBidNotification({ clientEmail, clientName, projectTitle, developerName, bidAmount }) {
  await resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: `New bid on "${projectTitle}"`,
    html: `
      <h2>New Bid Received</h2>
      <p>Hi ${clientName},</p>
      <p><strong>${developerName}</strong> has placed a bid of <strong>$${bidAmount}</strong> on your project <strong>"${projectTitle}"</strong>.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/client/projects">View Bids</a></p>
    `,
  });
}

export async function sendBidAcceptedNotification({ developerEmail, developerName, projectTitle, amount }) {
  await resend.emails.send({
    from: FROM,
    to: developerEmail,
    subject: `Your bid was accepted for "${projectTitle}"`,
    html: `
      <h2>Bid Accepted! 🎉</h2>
      <p>Hi ${developerName},</p>
      <p>Your bid of <strong>$${amount}</strong> was accepted for project <strong>"${projectTitle}"</strong>.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/developer/contracts">View Contract</a></p>
    `,
  });
}

export async function sendPaymentReleasedNotification({ developerEmail, developerName, amount, projectTitle }) {
  await resend.emails.send({
    from: FROM,
    to: developerEmail,
    subject: `Payment released for "${projectTitle}"`,
    html: `
      <h2>Payment Released 💰</h2>
      <p>Hi ${developerName},</p>
      <p>A payment of <strong>$${amount}</strong> has been released for <strong>"${projectTitle}"</strong>.</p>
    `,
  });
}

export async function sendNewMessageNotification({ recipientEmail, recipientName, senderName }) {
  await resend.emails.send({
    from: FROM,
    to: recipientEmail,
    subject: `New message from ${senderName}`,
    html: `
      <h2>New Message</h2>
      <p>Hi ${recipientName},</p>
      <p>You have a new message from <strong>${senderName}</strong>.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/messages">View Message</a></p>
    `,
  });
}
