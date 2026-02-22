import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const minBudget = searchParams.get("minBudget");
  const maxBudget = searchParams.get("maxBudget");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";

  await connectDB();

  const query = { status: "open" };

  if (category && category !== "all") query.category = category;
  if (search) query.$or = [
    { title: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
  ];
  if (minBudget || maxBudget) {
    query.budgetMax = {};
    if (minBudget) query.budgetMax.$gte = Number(minBudget);
    if (maxBudget) query.budgetMax.$lte = Number(maxBudget);
  }

  const sortOption = sort === "newest" ? { createdAt: -1 }
    : sort === "oldest" ? { createdAt: 1 }
    : sort === "budget_high" ? { budgetMax: -1 }
    : { budgetMax: 1 };

  const projects = await Project.find(query).sort(sortOption).limit(50).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(projects)));
}