import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const clerkUser = await currentUser()
    const { role } = await req.json()
    await connectDB()
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        imageUrl: clerkUser.imageUrl,
        role: role || 'client',
        onboardingComplete: true,
      },
      { upsert: true, new: true }
    )
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
