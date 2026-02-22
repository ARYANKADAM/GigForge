import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Project from '@/models/Project'
import User from '@/models/User'

export async function GET(req) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const query = { status: 'open' }
    if (searchParams.get('category')) query.category = searchParams.get('category')
    // optional budget range filters (minBudget, maxBudget)
    const min = searchParams.get('minBudget')
    const max = searchParams.get('maxBudget')
    if (min || max) {
      query.budget = {}
      if (min) query.budget.$gte = Number(min)
      if (max) query.budget.$lte = Number(max)
    }
    const projects = await Project.find(query).populate('clientId', 'firstName lastName imageUrl').sort({ createdAt: -1 }).limit(20).lean()
    return NextResponse.json(projects)
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
    if (!user || user.role !== 'client') return NextResponse.json({ error: 'Only clients can post projects' }, { status: 403 })
    const { title, description, category, budget, deadline, skills } = await req.json()
    if (!title || !description || !category || budget == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const project = await Project.create({
      title,
      description,
      category,
      budget: Number(budget),
      deadline: deadline || null,
      skills: skills || [],
      clientId: user._id,
      clientClerkId: userId,
    })
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
