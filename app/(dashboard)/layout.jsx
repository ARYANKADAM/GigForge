import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";

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
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar role={String(role)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto p-6 main-scroll">
          {children}
        </main>
      </div>
    </div>
  );
}