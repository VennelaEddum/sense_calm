import type { LearningQuestion } from "@/types";

export const learningTopics: Record<string, LearningQuestion[]> = {
  colours: [
    {
      prompt: "Find the RED colour",
      choices: ["🔴 Red", "🔵 Blue", "🟡 Yellow"],
      answer: 0,
    },
    {
      prompt: "Find the BLUE colour",
      choices: ["🟢 Green", "🔵 Blue", "🟣 Purple"],
      answer: 1,
    },
    {
      prompt: "Find the YELLOW colour",
      choices: ["🟠 Orange", "🔴 Red", "🟡 Yellow"],
      answer: 2,
    },
    {
      prompt: "Find the GREEN colour",
      choices: ["🔵 Blue", "🟢 Green", "🔴 Red"],
      answer: 1,
    },
  ],
  numbers: [
    {
      prompt: "Which number comes after 1?",
      choices: ["3", "2", "4"],
      answer: 1,
    },
    {
      prompt: "How many stars? ⭐ ⭐ ⭐",
      choices: ["2", "4", "3"],
      answer: 2,
    },
    {
      prompt: "Choose number 5",
      choices: ["5", "2", "1"],
      answer: 0,
    },
    {
      prompt: "How many fingers? ✋ (one hand)",
      choices: ["3", "5", "2"],
      answer: 1,
    },
  ],
  shapes: [
    {
      prompt: "Which one is a circle?",
      choices: ["🔺 Triangle", "⚪ Circle", "🟦 Square"],
      answer: 1,
    },
    {
      prompt: "Which one is a triangle?",
      choices: ["🔺 Triangle", "🟡 Circle", "🟥 Square"],
      answer: 0,
    },
    {
      prompt: "Which one is a square?",
      choices: ["⭐ Star", "⚪ Circle", "🟦 Square"],
      answer: 2,
    },
    {
      prompt: "Which one is a star?",
      choices: ["⭐ Star", "🟦 Square", "🔵 Circle"],
      answer: 0,
    },
  ],
};

export const routineItems = [
  "Brush my teeth",
  "Get dressed",
  "Have breakfast",
  "Pack my bag",
  "Take a little break",
  "Get ready for bed",
];

export const communicationMessages: [string, string][] = [
  ["🆘", "I need help"],
  ["🤫", "I need quiet"],
  ["🌿", "I need a break"],
  ["💧", "I want water"],
  ["🍎", "I am hungry"],
  ["🚻", "I need the toilet"],
  ["😟", "I feel upset"],
  ["😊", "I feel happy"],
  ["🙋", "I want to ask something"],
  ["🏠", "I want to go home"],
  ["❤️", "I need someone with me"],
  ["👍", "I am okay"],
];
