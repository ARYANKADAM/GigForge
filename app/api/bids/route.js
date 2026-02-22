import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Bid from '@/models/Bid'
import Project from '@/models/Project'
import User from '@/models/User'

export async function GET(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const bids = await Bid.find({ developerClerkId: userId })
      .populate('projectId', 'title status budget')
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json(bids)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const user = await User.findOne({ clerkId: userId })
    if (!user || user.role !== 'developer') return NextResponse.json({ error: 'Only developers can bid' }, { status: 403 })
    const { projectId, amount, deliveryDays, proposal } = await req.json()
    const project = await Project.findById(projectId)
    if (!project || project.status !== 'open') return NextResponse.json({ error: 'Project not available' }, { status: 404 })
    if (project.clientClerkId === userId) return NextResponse.json({ error: 'Cannot bid on your own project' }, { status: 400 })
    const existing = await Bid.findOne({ projectId, developerClerkId: userId })
    if (existing) return NextResponse.json({ error: 'Already bid on this project' }, { status: 400 })
    const bid = await Bid.create({
      projectId, amount: Number(amount), deliveryDays: Number(deliveryDays),
      proposal, developerId: user._id, developerClerkId: userId,
    })
    await Project.findByIdAndUpdate(projectId, { $inc: { bidsCount: 1 } })
    return NextResponse.json(bid, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
