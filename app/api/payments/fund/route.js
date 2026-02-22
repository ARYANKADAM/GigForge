import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contractId, paymentIntentId } = await req.json();
  await connectDB();

  const contract = await Contract.findById(contractId);
  if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  if (contract.clientId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Confirm with test card — disable redirects to avoid return_url requirement
  await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: "pm_card_visa",
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/contracts`,
  });

  await Contract.findByIdAndUpdate(contractId, {
    stripePaymentIntentId: paymentIntentId,
    escrowStatus: "funded",
  });

  return NextResponse.json({ success: true });
}