"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const gen_ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = gen_ai.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unaothorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("User not found");
  try {
    const prompt = `
    Generate 10 technical interview questions for a ${
      user.industry
    } professional${
      user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
    }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

    const result = await model.generateContent(prompt);
    const response = result.response
      .text()
      .replace(/```(?:json)?\n?/g, "")
      .trim();

    return JSON.parse(response).questions;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unaothorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nYour Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementTipPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      const result = await model.generateContent(improvementTipPrompt);
      const response = result.response;
      improvementTip = response.text().trim();
    } catch (error) {
      throw new Error("Error in improvement tip" + error.message);
    }

    try {
      const assessment = await db.assessment.create({
        data: {
          userId: user.id,
          quizScore: score,
          questions: questionResults,
          category: "Technical",
          improvementTip,
        },
      });
      return assessment;
    } catch (error) {
      throw new Error("Failed to save quiz result" + error.message);
    }
  }
}
