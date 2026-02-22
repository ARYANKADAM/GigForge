import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function PATCH(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    await connectDB()
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: body },
      { new: true }
    )
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
