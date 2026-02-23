"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    // ✅ Step 1: Check if industry exists BEFORE the transaction
    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: data.industry },
    });

    // ✅ Step 2: If not, call Gemini OUTSIDE the transaction (this is the slow part)
    if (!industryInsight) {
      const insights = await generateAIInsights(data.industry);
      // ✅ Step 3: Create industry insight OUTSIDE transaction too
      industryInsight = await db.industryInsight.create({
        data: {
          industry: data.industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // ✅ Step 4: Transaction now only does the fast user update
    const result = await db.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          industry: data.industry,
          experience: data.experience,
          bio: data.bio,
          skills: data.skills,
        },
      });
      return { updatedUser, industryInsight };
    });

    revalidatePath("/");
    return result.updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true },
  });
  if (!user) throw new Error("User not found");

  return {
    isOnboarded: !!user?.industry,
  };
}