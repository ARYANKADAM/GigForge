import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/shared/ProfileClient";
import connectDB from "@/lib/db";
import User from "@/models/User";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).lean();

  return <ProfileClient initialUser={JSON.parse(JSON.stringify(user))} />;
}