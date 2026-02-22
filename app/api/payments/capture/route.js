import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import User from "@/models/User";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contractId } = await req.json();
  await connectDB();

  const contract = await Contract.findById(contractId);
  if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  if (contract.clientId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!contract.stripePaymentIntentId) return NextResponse.json({ error: "No payment intent" }, { status: 400 });

  // Release escrow - capture the payment
  await stripe.paymentIntents.capture(contract.stripePaymentIntentId);

  await Contract.findByIdAndUpdate(contractId, { escrowStatus: "released" });

  // Update earnings
  await User.findOneAndUpdate(
  { clerkId: contract.developerId },
  { 
    $inc: { totalEarned: contract.agreedAmount },
    $setOnInsert: { clerkId: contract.developerId } 
  },
  { upsert: true }
);

  return NextResponse.json({ success: true });
}
