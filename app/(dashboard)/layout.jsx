import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/shared/DashboardShell";

export default async function DashboardLayout({ children }) {
  let userId;
  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch (err) {
    redirect("/sign-in");
  }
  if (!userId) redirect("/sign-in");

  let role, clerkUser;
  try {
    clerkUser = await currentUser();
    role = clerkUser?.unsafeMetadata?.role;
  } catch (err) {
    redirect("/sign-in");
  }

  if (!role) redirect("/onboarding");

  const user = {
    firstName: clerkUser?.firstName || "",
    lastName: clerkUser?.lastName || "",
    imageUrl: clerkUser?.imageUrl || "",
  };

  return (
    <DashboardShell role={String(role)} user={user}>
      {children}
    </DashboardShell>
  );
}