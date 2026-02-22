import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ReviewsClient from "@/components/shared/ReviewsClient";

export default async function ReviewsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <ReviewsClient currentUserId={userId} />;
}