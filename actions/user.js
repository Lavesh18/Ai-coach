"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateAiInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unaothorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("User not found");

  try {
    const result = await db.$transaction(
      async (tx) => {
        // find if industry exists

        let industryInsights = await tx.industryInsights.findUnique({
            where:{
                industry:data.industry
            }
        })
        //if not we will create with the default values but later we will use ai -logic

        if(!industryInsights)
        {
          const insights = await generateAiInsights(data.industry);
           industryInsights = await db.industryInsights.create({
                   data:{
                          industry:data.industry,
                          ...insights,
                          nextUpdate: new Date(Date.now() + 7*24*60*60*1000)
                      }
              })
        }
        //update user

        const updateUser = await tx.user.update({
            where:{
                id:user.id
            },
            data:{
                industry:data.industry,
                experience:data.experience,
                bio:data.bio,
                skills:data.skills
            }
        })


        return {updateUser,industryInsights}
      },
      {
        timeout: 10000,
      }
    );

    return {success:true,...result};
  } catch (error) {
    throw new Error(`Failed to udpate profile ${error.message}`);
  }
}


export async function getUserOnboardingStatus() {
    const { userId } = await auth();
  if (!userId) throw new Error("Unaothorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("User not found");

  try {
    const user = await db.user.findUnique({
        where:{
            clerkUserId:userId
        },
        select:{
            industry:true,
        }
    });

    return {
        isOnboarded:!!user?.industry
    }
  } catch (error) {
    throw new Error(`Failed to check onboarding status ${error.message}`);
  }
}