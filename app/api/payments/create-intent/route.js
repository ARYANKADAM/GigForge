import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contractId } = await req.json();
  await connectDB();

  const contract = await Contract.findById(contractId);
  if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  if (contract.clientId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Create a manual-capture PaymentIntent (escrow)
 const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(contract.agreedAmount * 100),
  currency: "usd",
  capture_method: "manual",
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: "never", // ✅ no redirect-based methods, no return_url needed
  },
  metadata: {
    contractId: contractId,
    clientId: userId,
    developerId: contract.developerId,
  },
});

  await Contract.findByIdAndUpdate(contractId, {
    stripePaymentIntentId: paymentIntent.id,
    escrowStatus: "pending",
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
}
