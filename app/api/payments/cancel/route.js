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
  if (!contract.stripePaymentIntentId) return NextResponse.json({ error: "No payment" }, { status: 400 });

  await stripe.paymentIntents.cancel(contract.stripePaymentIntentId);
  await Contract.findByIdAndUpdate(contractId, { escrowStatus: "refunded", status: "cancelled" });

  return NextResponse.json({ success: true });
}
