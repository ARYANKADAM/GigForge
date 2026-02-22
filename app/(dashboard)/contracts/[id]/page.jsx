import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import ContractDetail from "@/components/shared/ContractDetail";

export default async function ContractPage({ params }) {
  const { userId } = await auth();
  await connectDB();

  const { id } = await params; // unwrap promise
  if (!id) {
    return <div className="text-center py-16">Invalid contract id.</div>;
  }

  const contract = await Contract.findById(id).lean();
  if (!contract) return <div className="text-center py-16">Contract not found.</div>;

  return <ContractDetail contract={JSON.parse(JSON.stringify(contract))} currentUserId={userId} />;
}
