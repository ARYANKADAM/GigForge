import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BrowseProjects from "@/components/shared/BrowseProjects";

export default async function BrowseProjectsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <BrowseProjects />;
}