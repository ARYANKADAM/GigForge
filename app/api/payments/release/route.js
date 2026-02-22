import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Contract from '@/models/Contract'
import Project from '@/models/Project'
import User from '@/models/User'
import stripe from '@/lib/stripe'

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { contractId } = await req.json()
    await connectDB()
    const contract = await Contract.findById(contractId).populate('clientId developerId')
    if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    const clientUser = await User.findOne({ clerkId: userId })
    if (contract.clientId._id.toString() !== clientUser._id.toString()) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    if (contract.escrowStatus !== 'held') return NextResponse.json({ error: 'Payment not in escrow' }, { status: 400 })
    await stripe.paymentIntents.capture(contract.stripePaymentIntentId)
    await Contract.findByIdAndUpdate(contractId, { escrowStatus: 'released', status: 'completed', completedAt: new Date() })
    await Project.findByIdAndUpdate(contract.projectId, { status: 'completed' })
    await User.findByIdAndUpdate(contract.developerId._id, { $inc: { totalEarnings: contract.amount, completedProjects: 1 } })
    await User.findByIdAndUpdate(contract.clientId._id, { $inc: { totalSpent: contract.amount } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
