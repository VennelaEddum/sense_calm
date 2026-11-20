import type { LearningQuestion, GameId } from "@/types";

export const learningTopics: Record<string, LearningQuestion[]> = {
  colours: [
    { prompt: "Find the RED colour", choices: ["🔴 Red", "🔵 Blue", "🟡 Yellow"], answer: 0 },
    { prompt: "Find the BLUE colour", choices: ["🟢 Green", "🔵 Blue", "🟣 Purple"], answer: 1 },
    { prompt: "Find the YELLOW colour", choices: ["🟠 Orange", "🔴 Red", "🟡 Yellow"], answer: 2 },
    { prompt: "Find the GREEN colour", choices: ["🔵 Blue", "🟢 Green", "🔴 Red"], answer: 1 },
  ],
  numbers: [
    { prompt: "Which number comes after 1?", choices: ["3", "2", "4"], answer: 1 },
    { prompt: "How many stars? ⭐ ⭐ ⭐", choices: ["2", "4", "3"], answer: 2 },
    { prompt: "Choose number 5", choices: ["5", "2", "1"], answer: 0 },
    { prompt: "How many fingers? ✋ (one hand)", choices: ["3", "5", "2"], answer: 1 },
  ],
  shapes: [
    { prompt: "Which one is a circle?", choices: ["🔺 Triangle", "⚪ Circle", "🟦 Square"], answer: 1 },
    { prompt: "Which one is a triangle?", choices: ["🔺 Triangle", "🟡 Circle", "🟥 Square"], answer: 0 },
    { prompt: "Which one is a square?", choices: ["⭐ Star", "⚪ Circle", "🟦 Square"], answer: 2 },
    { prompt: "Which one is a star?", choices: ["⭐ Star", "🟦 Square", "🔵 Circle"], answer: 0 },
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

/* ===== AAC picture cards for sentence building ===== */
export interface AacCard {
  id: string;
  emoji: string;
  label: string;
  telugu: string;
  category: string;
}

export const aacCards: AacCard[] = [
  { id: "water", emoji: "💧", label: "Water", telugu: "నీరు", category: "needs" },
  { id: "food", emoji: "🍎", label: "Food", telugu: "ఆహారం", category: "needs" },
  { id: "help", emoji: "🆘", label: "Help", telugu: "సహాయం", category: "needs" },
  { id: "bathroom", emoji: "🚻", label: "Toilet", telugu: "మరుగుదొడ్డి", category: "needs" },
  { id: "break", emoji: "🌿", label: "Break", telugu: "విరామం", category: "needs" },
  { id: "quiet", emoji: "🤫", label: "Quiet", telugu: "నిశ్శబ్దం", category: "needs" },
  { id: "home", emoji: "🏠", label: "Home", telugu: "ఇల్లు", category: "places" },
  { id: "school", emoji: "🏫", label: "School", telugu: "పాఠశాల", category: "places" },
  { id: "play", emoji: "🎮", label: "Play", telugu: "ఆడటం", category: "actions" },
  { id: "eat", emoji: "🍽️", label: "Eat", telugu: "తినడం", category: "actions" },
  { id: "drink", emoji: "🥤", label: "Drink", telugu: "త్రాగడం", category: "actions" },
  { id: "sleep", emoji: "😴", label: "Sleep", telugu: "నిద్ర", category: "actions" },
  { id: "happy", emoji: "😊", label: "Happy", telugu: "సంతోషం", category: "feelings" },
  { id: "sad", emoji: "😢", label: "Sad", telugu: "దుఃఖం", category: "feelings" },
  { id: "angry", emoji: "😠", label: "Angry", telugu: "కోపం", category: "feelings" },
  { id: "scared", emoji: "😨", label: "Scared", telugu: "భయం", category: "feelings" },
  { id: "yes", emoji: "✅", label: "Yes", telugu: "అవును", category: "responses" },
  { id: "no", emoji: "❌", label: "No", telugu: "కాదు", category: "responses" },
];

/* ===== Game 1: Picture Detective ===== */
export interface PictureDetectiveQuestion {
  sceneEmoji: string;
  sceneDescription: string;
  prompt: string;
  options: { emoji: string; label: string; correct: boolean }[];
}

export const pictureDetectiveQuestions: PictureDetectiveQuestion[] = [
  {
    sceneEmoji: "🌧️☔🏃",
    sceneDescription: "It is raining outside",
    prompt: "What do you need?",
    options: [
      { emoji: "🧢", label: "Hat", correct: false },
      { emoji: "☂️", label: "Umbrella", correct: true },
      { emoji: "🧤", label: "Gloves", correct: false },
    ],
  },
  {
    sceneEmoji: "🌞🥵😤",
    sceneDescription: "It is a very hot day",
    prompt: "What do you want?",
    options: [
      { emoji: "💧", label: "Water", correct: true },
      { emoji: "🧥", label: "Jacket", correct: false },
      { emoji: "📚", label: "Book", correct: false },
    ],
  },
  {
    sceneEmoji: "🏫📚✏️",
    sceneDescription: "You are in the classroom",
    prompt: "What do you use to write?",
    options: [
      { emoji: "🍽️", label: "Spoon", correct: false },
      { emoji: "✏️", label: "Pencil", correct: true },
      { emoji: "🧸", label: "Toy", correct: false },
    ],
  },
  {
    sceneEmoji: "🌙🛏️😴",
    sceneDescription: "It is night time",
    prompt: "What do you want to do?",
    options: [
      { emoji: "🏃", label: "Run", correct: false },
      { emoji: "😴", label: "Sleep", correct: true },
      { emoji: "🍕", label: "Eat pizza", correct: false },
    ],
  },
  {
    sceneEmoji: "🤕🩹😭",
    sceneDescription: "You hurt your finger",
    prompt: "What do you need?",
    options: [
      { emoji: "🎮", label: "Game", correct: false },
      { emoji: "🆘", label: "Help", correct: true },
      { emoji: "⚽", label: "Ball", correct: false },
    ],
  },
];

/* ===== Game 2: Emotion Explorer ===== */
export interface EmotionQuestion {
  emoji: string;
  options: { emoji: string; label: string; correct: boolean }[];
}

export const emotionQuestions: EmotionQuestion[] = [
  {
    emoji: "😄",
    options: [
      { emoji: "😄", label: "Happy", correct: true },
      { emoji: "😢", label: "Sad", correct: false },
      { emoji: "😠", label: "Angry", correct: false },
    ],
  },
  {
    emoji: "😭",
    options: [
      { emoji: "😨", label: "Scared", correct: false },
      { emoji: "😢", label: "Sad", correct: true },
      { emoji: "😮", label: "Surprised", correct: false },
    ],
  },
  {
    emoji: "😡",
    options: [
      { emoji: "😠", label: "Angry", correct: true },
      { emoji: "😄", label: "Happy", correct: false },
      { emoji: "😴", label: "Sleepy", correct: false },
    ],
  },
  {
    emoji: "😱",
    options: [
      { emoji: "😊", label: "Happy", correct: false },
      { emoji: "😨", label: "Scared", correct: true },
      { emoji: "😡", label: "Angry", correct: false },
    ],
  },
  {
    emoji: "😲",
    options: [
      { emoji: "😮", label: "Surprised", correct: true },
      { emoji: "😢", label: "Sad", correct: false },
      { emoji: "😠", label: "Angry", correct: false },
    ],
  },
];

/* ===== Game 3: Build the Sentence ===== */
export interface BuildSentencePuzzle {
  id: string;
  pieces: { emoji: string; label: string }[];
  correctOrder: number[];
  sentence: string;
}

export const buildSentencePuzzles: BuildSentencePuzzle[] = [
  {
    id: "want-water",
    pieces: [
      { emoji: "👦", label: "I" },
      { emoji: "💧", label: "water" },
      { emoji: "🤲", label: "want" },
    ],
    correctOrder: [0, 2, 1],
    sentence: "I want water",
  },
  {
    id: "need-help",
    pieces: [
      { emoji: "👧", label: "I" },
      { emoji: "🆘", label: "help" },
      { emoji: "🤲", label: "need" },
    ],
    correctOrder: [0, 2, 1],
    sentence: "I need help",
  },
  {
    id: "want-eat",
    pieces: [
      { emoji: "👦", label: "I" },
      { emoji: "🍎", label: "food" },
      { emoji: "🍽️", label: "want" },
    ],
    correctOrder: [0, 2, 1],
    sentence: "I want food",
  },
  {
    id: "feel-happy",
    pieces: [
      { emoji: "👧", label: "I" },
      { emoji: "😊", label: "happy" },
      { emoji: "❤️", label: "feel" },
    ],
    correctOrder: [0, 2, 1],
    sentence: "I feel happy",
  },
];

/* ===== Game 4: What Happens Next? ===== */
export interface SequenceQuestion {
  sequence: { emoji: string; description: string }[];
  prompt: string;
  options: { emoji: string; label: string; correct: boolean }[];
}

export const sequenceQuestions: SequenceQuestion[] = [
  {
    sequence: [
      { emoji: "🥵", description: "You feel thirsty" },
      { emoji: "👀", description: "You see a water bottle" },
    ],
    prompt: "What happens next?",
    options: [
      { emoji: "💧", label: "Drink water", correct: true },
      { emoji: "🏃", label: "Go run", correct: false },
      { emoji: "😴", label: "Go to sleep", correct: false },
    ],
  },
  {
    sequence: [
      { emoji: "🌅", description: "Morning time" },
      { emoji: "🪥", description: "You brush your teeth" },
    ],
    prompt: "What happens next?",
    options: [
      { emoji: "🛏️", label: "Go to bed", correct: false },
      { emoji: "🍞", label: "Eat breakfast", correct: true },
      { emoji: "🌙", label: "Night time", correct: false },
    ],
  },
  {
    sequence: [
      { emoji: "📚", description: "Class is going on" },
      { emoji: "✋", description: "You want to ask something" },
    ],
    prompt: "What happens next?",
    options: [
      { emoji: "🙋", label: "Raise your hand", correct: true },
      { emoji: "🏃", label: "Run outside", correct: false },
      { emoji: "😴", label: "Go to sleep", correct: false },
    ],
  },
  {
    sequence: [
      { emoji: "🤕", description: "You fall and hurt your knee" },
      { emoji: "😭", description: "It hurts a lot" },
    ],
    prompt: "What should you do?",
    options: [
      { emoji: "🎮", label: "Play a game", correct: false },
      { emoji: "🆘", label: "Ask for help", correct: true },
      { emoji: "🍫", label: "Eat chocolate", correct: false },
    ],
  },
];

/* ===== Game 5: Everyday Situation Challenge ===== */
export interface SituationQuestion {
  scenario: { emoji: string; description: string };
  prompt: string;
  options: { emoji: string; label: string; correct: boolean }[];
}

export const situationQuestions: SituationQuestion[] = [
  {
    scenario: { emoji: "🗣️", description: "Your teacher is talking to the class" },
    prompt: "What should you do?",
    options: [
      { emoji: "👂", label: "Listen carefully", correct: true },
      { emoji: "🗣️", label: "Shout loudly", correct: false },
      { emoji: "🎮", label: "Play on phone", correct: false },
    ],
  },
  {
    scenario: { emoji: "🚪", description: "You want to go to the toilet" },
    prompt: "What should you do?",
    options: [
      { emoji: "🏃", label: "Run out", correct: false },
      { emoji: "🙋", label: "Ask permission", correct: true },
      { emoji: "😢", label: "Sit quietly and wait", correct: false },
    ],
  },
  {
    scenario: { emoji: "🤝", description: "A new student joins your class" },
    prompt: "What should you do?",
    options: [
      { emoji: "😊", label: "Say hello and be friendly", correct: true },
      { emoji: "😤", label: "Ignore them", correct: false },
      { emoji: "🏃", label: "Run away", correct: false },
    ],
  },
  {
    scenario: { emoji: "🔥", description: "You see something burning" },
    prompt: "What should you do?",
    options: [
      { emoji: "🔥", label: "Touch it", correct: false },
      { emoji: "🆘", label: "Tell a teacher immediately", correct: true },
      { emoji: "📸", label: "Take a photo", correct: false },
    ],
  },
  {
    scenario: { emoji: "🎒", description: "School is over for the day" },
    prompt: "What should you do?",
    options: [
      { emoji: "🏠", label: "Go home safely", correct: true },
      { emoji: "🎮", label: "Stay and play alone", correct: false },
      { emoji: "😢", label: "Cry", correct: false },
    ],
  },
];

export interface GameMeta {
  id: GameId;
  title: string;
  emoji: string;
  description: string;
  color: string;
  borderColor: string;
  textColor: string;
}

export const gameList: GameMeta[] = [
  { id: "picture-detective", title: "Picture Detective", emoji: "🔍", description: "Look at the picture and find the right answer!", color: "bg-[#B9D5B9]", borderColor: "border-[#A3C5A5]", textColor: "text-[#385D40]" },
  { id: "emotion-explorer", title: "Emotion Explorer", emoji: "😀", description: "Can you find the matching feeling?", color: "bg-[#F5DCE3]", borderColor: "border-[#E0BCc6]", textColor: "text-[#754D5B]" },
  { id: "build-sentence", title: "Build the Sentence", emoji: "🧩", description: "Put the pictures in order to make a sentence!", color: "bg-[#EBCB79]", borderColor: "border-[#DDBB63]", textColor: "text-[#73531E]" },
  { id: "what-happens-next", title: "What Happens Next?", emoji: "🔮", description: "Look at the story and guess what comes next!", color: "bg-[#E5EFF7]", borderColor: "border-[#D2E2EF]", textColor: "text-[#58758C]" },
  { id: "everyday-challenge", title: "Everyday Challenge", emoji: "🏫", description: "What should you do in real-life situations?", color: "bg-[#D99B7F]", borderColor: "border-[#CA896C]", textColor: "text-[#713F2E]" },
];

export const milestoneBadges: { days: number; emoji: string; label: string }[] = [
  { days: 3, emoji: "🌱", label: "3 Day Sprout" },
  { days: 7, emoji: "🔥", label: "7 Day Flame" },
  { days: 14, emoji: "⭐", label: "14 Day Star" },
  { days: 30, emoji: "🏆", label: "30 Day Champion" },
];
