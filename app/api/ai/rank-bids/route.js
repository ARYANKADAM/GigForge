import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { bids, project } = await req.json();
    if (!bids?.length) return NextResponse.json([]);

    const bidsInfo = bids.map((b, i) => ({
      index: i,
      id: b._id,
      amount: b.amount,
      deliveryDays: b.deliveryDays,
      proposal: b.proposal?.slice(0, 200),
      developerName: b.developerName,
    }));

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert at evaluating freelance bids. Analyze bids and return a JSON array with rankings. Return ONLY a JSON array, no explanation.

Each item must have:
{
  "id": "bid _id string",
  "score": number 1-100,
  "tag": "Best Match" | "Best Value" | "Fastest" | "Premium" | null,
  "reason": "one short sentence why this bid stands out or not"
}

Scoring criteria:
- Proposal quality and relevance (40%)
- Price vs project budget (30%)
- Delivery speed (20%)
- Overall value (10%)`,
        },
        {
          role: "user",
          content: `Project: "${project.title}" with budget $${project.budget}.
          
Bids: ${JSON.stringify(bidsInfo)}

Rank these bids and assign tags to the top ones only.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content || "[]";
    const rankings = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return NextResponse.json(rankings);
  } catch (err) {
    console.error("AI rank error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}