import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";

export default async function DashboardLayout({ children }) {
  let userId;
  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch (err) {
    console.error("DashboardLayout: auth() failed", err);
    redirect("/sign-in");
  }
  if (!userId) redirect("/sign-in");

  let role;
  try {
    const clerkUser = await currentUser();
    role = clerkUser?.unsafeMetadata?.role;
  } catch (err) {
    // If Clerk API fails for some reason, log and force sign-in redirect
    console.error("DashboardLayout: failed to fetch currentUser", err);
    redirect("/sign-in");
  }

  if (!role) redirect("/onboarding");

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role={String(role)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}