"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export async function startSimulation({ role, company, day }) {
  const prompt = `
You are a career simulation engine. The user is simulating Day ${day} as a "${role}" at a "${company}".

Generate a realistic, immersive workday scenario. Return ONLY valid JSON, no markdown, no explanation.

{
  "dayTitle": "short punchy title for today e.g. 'The Outage at 9AM'",
  "briefing": "2-3 sentence morning briefing as if their manager is speaking to them directly. Be specific and realistic.",
  "tasks": [
    { "id": "t1", "title": "Task title", "priority": "high|medium|low", "description": "What they need to do, 1-2 sentences", "type": "code|meeting|review|design|research|email" }
  ],
  "emails": [
    { "id": "e1", "from": "Name (Role)", "subject": "Subject line", "preview": "First line of email...", "body": "Full realistic email body, 3-5 sentences", "urgent": true|false }
  ],
  "challenge": {
    "title": "Challenge title",
    "scenario": "A realistic problem they must solve right now. 2-3 sentences. Be dramatic but real.",
    "options": [
      { "id": "a", "text": "Option A text" },
      { "id": "b", "text": "Option B text" },
      { "id": "c", "text": "Option C text" }
    ]
  },
  "xp": 100
}

Make tasks array have exactly 3 tasks. Make emails array have exactly 2 emails. Be specific to the role and company type. Make it feel like a real job.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function resolveChallenge({ role, company, challenge, choiceId, choiceText }) {
  const prompt = `
You are a career simulation engine. A "${role}" at "${company}" just faced this challenge:
"${challenge}"

They chose: "${choiceText}"

Return ONLY valid JSON:
{
  "outcome": "2-3 sentences describing what happened as a direct consequence of their choice. Be vivid and realistic.",
  "consequence": "good|neutral|bad",
  "xpGained": number between 10 and 150,
  "lesson": "One short sentence — the key career lesson from this decision.",
  "managerReaction": "One line of what their manager said to them after."
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function getEmailReply({ role, emailBody, userReply }) {
  const prompt = `
You are simulating a realistic work email exchange. The user is a "${role}".

Original email: "${emailBody}"
User's reply: "${userReply}"

Return ONLY valid JSON:
{
  "reply": "A realistic response from the sender, 2-4 sentences. React naturally to what the user said.",
  "tone": "positive|neutral|negative",
  "tip": "One short tip on professional email communication based on the user's reply."
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}