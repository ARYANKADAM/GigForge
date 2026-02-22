import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import stripe from '@/lib/stripe'
import connectDB from '@/lib/db'
import Bid from '@/models/Bid'
import Project from '@/models/Project'
import Contract from '@/models/Contract'

export async function POST(req) {
  const body = await req.text()
  const headerPayload = await headers()
  const sig = headerPayload.get('stripe-signature')
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
  await connectDB()
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { bidId, projectId, clientId, developerId } = session.metadata
    const bid = await Bid.findById(bidId)
    await Contract.create({
      projectId, bidId, clientId, developerId,
      amount: bid.amount,
      stripePaymentIntentId: session.payment_intent,
      escrowStatus: 'held', status: 'active',
    })
    await Bid.findByIdAndUpdate(bidId, { status: 'accepted' })
    await Project.findByIdAndUpdate(projectId, { status: 'in_progress', selectedBid: bidId, selectedDeveloper: developerId })
  }
  return NextResponse.json({ received: true })
}
