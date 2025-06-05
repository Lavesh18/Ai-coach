"use client";

import { generateQuiz } from "@/actions/interview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import { useState } from "react";
import { BarLoader } from "react-spinners";

const Quiz=() => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch(generateQuiz);

  if (generatingQuiz) {
    return <BarLoader className="mt-4" width={"100%"} color="gray" />;
  }

//add timer also 
  if (!quizData) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This quiz contains 10 questions specific to your industry and
            skills. Take your time and choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuizFn} className="w-full">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }
  return (
    <div>Quiz</div>
  )
}


export default Quiz;