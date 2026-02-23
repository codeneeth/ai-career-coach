"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export async function analyzeSkillGap({ targetRole, targetCompany, userSkills }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  const prompt = `
You are an expert career coach and technical recruiter. Analyze the skill gap for someone who wants to work as a "${targetRole}" at "${targetCompany}".

The user's current skills are: ${userSkills.length > 0 ? userSkills.join(", ") : "none provided"}.
Their industry background: ${user?.industry || "not specified"}.
Their experience level: ${user?.experience || "not specified"}.

Return ONLY valid JSON, no markdown, no explanation:

{
  "requiredSkills": [
    { "name": "Skill name", "importance": 95, "category": "Technical|Soft|Domain" }
  ],
  "userSkillScores": [
    { "name": "Skill name", "score": 70, "required": 90, "category": "Technical|Soft|Domain" }
  ],
  "missingSkills": [
    { "name": "Skill name", "priority": "critical|high|medium", "timeToLearn": "2 weeks|1 month|3 months" }
  ],
  "overallGapPercent": 42,
  "readinessPercent": 58,
  "radarData": [
    { "subject": "Category name (max 6 chars)", "required": 90, "current": 55 }
  ],
  "learningPath": [
    { "step": 1, "title": "Short action title", "description": "What to do and why", "duration": "2 weeks", "resources": ["Resource 1", "Resource 2"] }
  ],
  "summary": "2 sentences — honest assessment of where they stand and what matters most."
}

Rules:
- requiredSkills: exactly 8 skills specific to ${targetRole} at ${targetCompany}
- userSkillScores: same 8 skills, estimate scores based on user's provided skills (0-100)
- missingSkills: only skills where score < 70
- radarData: exactly 6 categories covering the role (e.g. Algorithms, System Design, Leadership...)
- learningPath: exactly 4 steps, ordered by priority
- Be specific to ${targetCompany}'s known hiring bar and culture
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}