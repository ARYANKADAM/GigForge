import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { idea } = await req.json();
    if (!idea) return NextResponse.json({ error: "No idea provided" }, { status: 400 });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert project manager and technical writer. When given a rough project idea, generate a structured project brief in JSON format only. No explanation, no markdown, just pure JSON.

Return exactly this structure:
{
  "title": "concise project title",
  "description": "detailed 3-4 sentence project description with deliverables and requirements",
  "category": "one of: Web Development, Mobile App, UI/UX Design, Data Science, DevOps, Blockchain, AI/ML, Cybersecurity, Other",
  "budget": number (realistic USD amount),
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "deadline": "YYYY-MM-DD (realistic date 4-12 weeks from today)"
}`,
        },
        {
          role: "user",
          content: `Generate a project brief for this idea: ${idea}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content || "";
    const json = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return NextResponse.json(json);
  } catch (err) {
    console.error("AI brief error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}