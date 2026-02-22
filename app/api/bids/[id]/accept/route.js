import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Bid from '@/models/Bid'
import Project from '@/models/Project'
import Contract from '@/models/Contract'
import User from '@/models/User'
import stripe from '@/lib/stripe'

export async function POST(req, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const bid = await Bid.findById(params.id).populate('developerId')
    if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 })

    const project = await Project.findById(bid.projectId)
    if (project.clientClerkId !== userId) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    if (project.status !== 'open') return NextResponse.json({ error: 'Project not open' }, { status: 400 })

    const clientUser = await User.findOne({ clerkId: userId })

    // Create or get Stripe customer
    let customerId = clientUser.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({ email: clientUser.email, name: `${clientUser.firstName} ${clientUser.lastName}` })
      customerId = customer.id
      await User.findByIdAndUpdate(clientUser._id, { stripeCustomerId: customerId })
    }

    // Create Stripe Checkout Session with manual capture (escrow)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Project: ${project.title}`, description: `Payment to ${bid.developerId.firstName} ${bid.developerId.lastName}` },
          unit_amount: Math.round(bid.amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      payment_intent_data: { capture_method: 'manual' },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts?session_id={CHECKOUT_SESSION_ID}&bid_id=${bid._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${project._id}`,
      metadata: { bidId: bid._id.toString(), projectId: project._id.toString(), clientId: clientUser._id.toString(), developerId: bid.developerId._id.toString() },
    })

    return NextResponse.json({ paymentUrl: session.url })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
