import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Review from "@/models/Review";
import PublicProfile from "@/components/shared/PublicProfile";

export default async function PublicProfilePage({ params }) {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) redirect("/sign-in");

  const { userId } = await params;
  await connectDB();

  const user = await User.findOne({ clerkId: userId }).lean();
  if (!user) redirect("/dashboard");

  const reviews = await Review.find({ revieweeId: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return (
    <PublicProfile
      user={JSON.parse(JSON.stringify(user))}
      reviews={JSON.parse(JSON.stringify(reviews))}
    />
  );
}