import type {
  DetectiveClue,
  EmotionItem,
  SentencePuzzle,
  SequenceStory,
  EverydaySituation,
} from "@/types";

// ==========================================
// GAME 1: PICTURE DETECTIVE
// ==========================================
export const pictureDetectiveData: DetectiveClue[] = [
  {
    id: "detective_1",
    clue: "Find the animal that lives in the ocean and swims gracefully! 🌊",
    teluguClue: "సముద్రంలో అందంగా ఈదే జంతువును కనుగొనండి! 🌊",
    clueEmoji: "🔍",
    level: "easy",
    options: [
      { id: "opt_dolphin", label: "Dolphin", teluguLabel: "డాల్ఫిన్", emoji: "🐬", isCorrect: true },
      { id: "opt_cat", label: "Kitten", teluguLabel: "పిల్లిపిల్ల", emoji: "🐱", isCorrect: false, hint: "Kittens love sleeping on sofas!" },
      { id: "opt_tree", label: "Oak Tree", teluguLabel: "చెట్టు", emoji: "🌳", isCorrect: false, hint: "Trees grow on land!" },
      { id: "opt_car", label: "Bicycle", teluguLabel: "సైకిల్", emoji: "🚲", isCorrect: false, hint: "A bicycle is a vehicle!" },
    ],
  },
  {
    id: "detective_2",
    clue: "Find something yellow, sweet, and fun to peel! 🍌",
    teluguClue: "పసుపు రంగులో ఉండే తియ్యని పండును కనుగొనండి! 🍌",
    clueEmoji: "🔎",
    level: "easy",
    options: [
      { id: "opt_apple", label: "Red Apple", teluguLabel: "ఎర్రటి ఆపిల్", emoji: "🍎", isCorrect: false, hint: "Apples are delicious and red!" },
      { id: "opt_banana", label: "Banana", teluguLabel: "అరటిపండు", emoji: "🍌", isCorrect: true },
      { id: "opt_cloud", label: "Rain Cloud", teluguLabel: "వర్షపు మేఘం", emoji: "🌧️", isCorrect: false, hint: "Clouds float in the sky!" },
      { id: "opt_book", label: "Storybook", teluguLabel: "కథల పుస్తకం", emoji: "📖", isCorrect: false, hint: "Books are for reading!" },
    ],
  },
  {
    id: "detective_3",
    clue: "Find something that flies high in the night sky and twinkles! ⭐",
    teluguClue: "రాత్రి ఆకాశంలో మెరిసే నక్షత్రాన్ని కనుగొనండి! ⭐",
    clueEmoji: "✨",
    level: "medium",
    options: [
      { id: "opt_star", label: "Twinkling Star", teluguLabel: "మెరిసే నక్షత్రం", emoji: "⭐", isCorrect: true },
      { id: "opt_fish", label: "Goldfish", teluguLabel: "బంగారు చేప", emoji: "🐠", isCorrect: false, hint: "Fish swim in water!" },
      { id: "opt_flower", label: "Daisy Flower", teluguLabel: "పువ్వు", emoji: "🌼", isCorrect: false, hint: "Flowers grow in the garden!" },
      { id: "opt_clock", label: "Alarm Clock", teluguLabel: "గడియారం", emoji: "⏰", isCorrect: false, hint: "Clocks tell the time!" },
    ],
  },
  {
    id: "detective_4",
    clue: "Find something soft you hug when you go to sleep! 🧸",
    teluguClue: "నిద్రపోయేటప్పుడు మీరు హత్తుకునే మృదువైన బొమ్మను కనుగొనండి! 🧸",
    clueEmoji: "🌙",
    level: "medium",
    options: [
      { id: "opt_teddy", label: "Teddy Bear", teluguLabel: "టెడ్డీ బేర్", emoji: "🧸", isCorrect: true },
      { id: "opt_bus", label: "School Bus", teluguLabel: "స్కూల్ బస్సు", emoji: "🚌", isCorrect: false, hint: "Buses drive on the road!" },
      { id: "opt_spoon", label: "Soup Spoon", teluguLabel: "చెంచా", emoji: "🥄", isCorrect: false, hint: "Spoons are for eating!" },
      { id: "opt_shoe", label: "Sneakers", teluguLabel: "బూట్లు", emoji: "👟", isCorrect: false, hint: "Shoes go on your feet!" },
    ],
  },
  {
    id: "detective_5",
    clue: "Find the garden helper that has colorful wings and drinks flower nectar! 🦋",
    teluguClue: "రంగురంగుల రెక్కలు గల సీతాకోకచిలుకను కనుగొనండి! 🦋",
    clueEmoji: "🌸",
    level: "explorer",
    options: [
      { id: "opt_butterfly", label: "Butterfly", teluguLabel: "సీతాకోకచిలుక", emoji: "🦋", isCorrect: true },
      { id: "opt_frog", label: "Green Frog", teluguLabel: "పచ్చటి కప్ప", emoji: "🐸", isCorrect: false, hint: "Frogs leap in ponds!" },
      { id: "opt_sun", label: "Bright Sun", teluguLabel: "ప్రకాశవంతమైన సూర్యుడు", emoji: "☀️", isCorrect: false, hint: "The sun warms the whole world!" },
      { id: "opt_drum", label: "Music Drum", teluguLabel: "డ్రమ్", emoji: "🥁", isCorrect: false, hint: "Drums make rhythmic beats!" },
    ],
  },
];

// ==========================================
// GAME 2: EMOTION EXPLORER
// ==========================================
export const emotionExplorerData: EmotionItem[] = [
  {
    id: "emotion_happy",
    emotion: "Happy",
    teluguEmotion: "సంతోషం",
    emoji: "😊",
    color: "text-[#B88728]",
    bgColor: "bg-[#FFF9EA]",
    scenario: "Bebbo received a warm hug and built a tall block tower!",
    teluguScenario: "బెబ్బోకి ఆప్యాయమైన కౌగిలింత దక్కింది మరియు చక్కగా ఆడుకున్నాడు!",
    options: [
      { emotion: "Happy", emoji: "😊", isCorrect: true },
      { emotion: "Angry", emoji: "😠", isCorrect: false },
      { emotion: "Scared", emoji: "😨", isCorrect: false },
    ],
  },
  {
    id: "emotion_sad",
    emotion: "Sad",
    teluguEmotion: "బాధ",
    emoji: "😢",
    color: "text-[#4B6D87]",
    bgColor: "bg-[#EDF4F9]",
    scenario: "Bebbo's favorite drawing fell into a water puddle.",
    teluguScenario: "బెబ్బో గీసిన అందమైన బొమ్మ నీటిలో పడిపోయింది.",
    options: [
      { emotion: "Surprised", emoji: "😲", isCorrect: false },
      { emotion: "Sad", emoji: "😢", isCorrect: true },
      { emotion: "Happy", emoji: "😊", isCorrect: false },
    ],
  },
  {
    id: "emotion_angry",
    emotion: "Angry",
    teluguEmotion: "కోపం",
    emoji: "😠",
    color: "text-[#B34747]",
    bgColor: "bg-[#FDF0F0]",
    scenario: "Someone knocked over Bebbo's puzzle without asking.",
    teluguScenario: "ఎవరో అడగకుండానే బెబ్బో పజిల్‌ను పడదోశారు.",
    options: [
      { emotion: "Angry", emoji: "😠", isCorrect: true },
      { emotion: "Calm", emoji: "😌", isCorrect: false },
      { emotion: "Scared", emoji: "😨", isCorrect: false },
    ],
  },
  {
    id: "emotion_surprised",
    emotion: "Surprised",
    teluguEmotion: "ఆశ్చర్యం",
    emoji: "😲",
    color: "text-[#7B528A]",
    bgColor: "bg-[#F5EDF9]",
    scenario: "A magical rainbow suddenly appeared right outside the window!",
    teluguScenario: "కిటికీ బయట అకస్మాత్తుగా ఒక ఇంద్రధనస్సు కనిపించింది!",
    options: [
      { emotion: "Angry", emoji: "😠", isCorrect: false },
      { emotion: "Surprised", emoji: "😲", isCorrect: true },
      { emotion: "Sad", emoji: "😢", isCorrect: false },
    ],
  },
  {
    id: "emotion_scared",
    emotion: "Scared",
    teluguEmotion: "భయం",
    emoji: "😨",
    color: "text-[#7B6187]",
    bgColor: "bg-[#F4EEF7]",
    scenario: "A sudden loud thunder sound roared outside the house.",
    teluguScenario: "ఇంటి బయట పెద్ద ఉరుము శబ్దం వినిపించింది.",
    options: [
      { emotion: "Happy", emoji: "😊", isCorrect: false },
      { emotion: "Scared", emoji: "😨", isCorrect: true },
      { emotion: "Calm", emoji: "😌", isCorrect: false },
    ],
  },
  {
    id: "emotion_calm",
    emotion: "Calm",
    teluguEmotion: "ప్రశాంతత",
    emoji: "😌",
    color: "text-[#477057]",
    bgColor: "bg-[#EEF6F1]",
    scenario: "Bebbo is taking slow, gentle breaths in a quiet, cozy room.",
    teluguScenario: "బెబ్బో ప్రశాంతమైన గదిలో నెమ్మదిగా ఊపిరి తీసుకుంటున్నాడు.",
    options: [
      { emotion: "Calm", emoji: "😌", isCorrect: true },
      { emotion: "Surprised", emoji: "😲", isCorrect: false },
      { emotion: "Angry", emoji: "😠", isCorrect: false },
    ],
  },
];

// ==========================================
// GAME 3: BUILD THE SENTENCE
// ==========================================
export const buildSentenceData: SentencePuzzle[] = [
  {
    id: "sentence_1",
    targetSentence: "I want water",
    teluguSentence: "నాకు నీళ్లు కావాలి",
    hintEmoji: "💧",
    tokens: [
      { id: "t1_1", text: "I", teluguText: "నాకు", emoji: "🙋", order: 0 },
      { id: "t1_2", text: "want", teluguText: "కావాలి", emoji: "🤲", order: 1 },
      { id: "t1_3", text: "water", teluguText: "నీళ్లు", emoji: "💧", order: 2 },
    ],
  },
  {
    id: "sentence_2",
    targetSentence: "The cat is happy",
    teluguSentence: "పిల్లి సంతోషంగా ఉంది",
    hintEmoji: "🐱",
    tokens: [
      { id: "t2_1", text: "The cat", teluguText: "పిల్లి", emoji: "🐱", order: 0 },
      { id: "t2_2", text: "is", teluguText: "ఉంది", emoji: "✨", order: 1 },
      { id: "t2_3", text: "happy", teluguText: "సంతోషంగా", emoji: "😊", order: 2 },
    ],
  },
  {
    id: "sentence_3",
    targetSentence: "I like to draw",
    teluguSentence: "నాకు బొమ్మలు వేయడం ఇష్టం",
    hintEmoji: "🎨",
    tokens: [
      { id: "t3_1", text: "I", teluguText: "నాకు", emoji: "🙋", order: 0 },
      { id: "t3_2", text: "like to", teluguText: "ఇష్టం", emoji: "❤️", order: 1 },
      { id: "t3_3", text: "draw", teluguText: "బొమ్మలు వేయడం", emoji: "🎨", order: 2 },
    ],
  },
  {
    id: "sentence_4",
    targetSentence: "Bebbo loves sweet apples",
    teluguSentence: "బెబ్బోకి తియ్యని ఆపిల్స్ అంటే ఇష్టం",
    hintEmoji: "🍎",
    tokens: [
      { id: "t4_1", text: "Bebbo", teluguText: "బెబ్బోకి", emoji: "🐰", order: 0 },
      { id: "t4_2", text: "loves", teluguText: "ఇష్టం", emoji: "💖", order: 1 },
      { id: "t4_3", text: "sweet apples", teluguText: "తియ్యని ఆపిల్స్", emoji: "🍎", order: 2 },
    ],
  },
  {
    id: "sentence_5",
    targetSentence: "We play in the park",
    teluguSentence: "మేము పార్కులో ఆడుకుంటాము",
    hintEmoji: "🌳",
    tokens: [
      { id: "t5_1", text: "We", teluguText: "మేము", emoji: "👫", order: 0 },
      { id: "t5_2", text: "play in", teluguText: "ఆడుకుంటాము", emoji: "⚽", order: 1 },
      { id: "t5_3", text: "the park", teluguText: "పార్కులో", emoji: "🌳", order: 2 },
    ],
  },
];

// ==========================================
// GAME 4: WHAT HAPPENS NEXT?
// ==========================================
export const whatHappensNextData: SequenceStory[] = [
  {
    id: "seq_morning",
    title: "Morning Routine",
    teluguTitle: "ఉదయపు అలవాటు",
    steps: [
      { stepNumber: 1, label: "Wake up in the morning", teluguLabel: "ఉదయం నిద్ర లేవడం", emoji: "☀️" },
      { stepNumber: 2, label: "Brush your teeth", teluguLabel: "పళ్ళు తోముకోవడం", emoji: "🪥" },
    ],
    options: [
      { id: "opt_breakfast", label: "Eat a healthy breakfast", teluguLabel: "ఆరోగ్యకరమైన అల్పాహారం తినడం", emoji: "🥣", isCorrect: true },
      { id: "opt_sleep", label: "Go to bed for the night", teluguLabel: "రాత్రి నిద్రపోవడం", emoji: "🌙", isCorrect: false },
      { id: "opt_rain", label: "Open an umbrella indoors", teluguLabel: "ఇంట్లో గొడుగు తెరవడం", emoji: "☔", isCorrect: false },
    ],
  },
  {
    id: "seq_planting",
    title: "Growing a Flower",
    teluguTitle: "పువ్వు పెంచడం",
    steps: [
      { stepNumber: 1, label: "Plant a little seed in soil", teluguLabel: "మట్టిలో విత్తనం నాటడం", emoji: "🌱" },
      { stepNumber: 2, label: "Water it gently with sunlight", teluguLabel: "నీళ్లు పోసి సూర్యరశ్మి ఇవ్వడం", emoji: "💧" },
    ],
    options: [
      { id: "opt_bloom", label: "A colorful flower blooms!", teluguLabel: "అందమైన పువ్వు వికసిస్తుంది!", emoji: "🌸", isCorrect: true },
      { id: "opt_snow", label: "A snowman appears", teluguLabel: "మంచు బొమ్మ వస్తుంది", emoji: "⛄", isCorrect: false },
      { id: "opt_cut", label: "Throw away the pot", teluguLabel: "కుండీ పారవేయడం", emoji: "🗑️", isCorrect: false },
    ],
  },
  {
    id: "seq_wash_hands",
    title: "Washing Hands Before Lunch",
    teluguTitle: "భోజనానికి ముందు చేతులు కడుక్కోవడం",
    steps: [
      { stepNumber: 1, label: "Finish playing outside", teluguLabel: "బయట ఆట పూర్తి కావడం", emoji: "⚽" },
      { stepNumber: 2, label: "Wash hands with soap and water", teluguLabel: "సబ్బుతో చేతులు కడుక్కోవడం", emoji: "🧼" },
    ],
    options: [
      { id: "opt_lunch", label: "Enjoy delicious lunch with clean hands", teluguLabel: "పరిశుభ్రమైన చేతులతో భోజనం చేయడం", emoji: "🥪", isCorrect: true },
      { id: "opt_mud", label: "Jump into wet mud again", teluguLabel: "మళ్లీ బురదలో దూకడం", emoji: "🥾", isCorrect: false },
      { id: "opt_swim", label: "Jump in the river", teluguLabel: "నదిలో దూకడం", emoji: "🏊", isCorrect: false },
    ],
  },
  {
    id: "seq_bedtime",
    title: "Bedtime Routine",
    teluguTitle: "పడుకునే సమయం",
    steps: [
      { stepNumber: 1, label: "Put on comfy pajamas", teluguLabel: "పడుకునే బట్టలు వేసుకోవడం", emoji: "🧸" },
      { stepNumber: 2, label: "Read a bedtime story", teluguLabel: "కథ పుస్తకం చదవడం", emoji: "📖" },
    ],
    options: [
      { id: "opt_sleep_well", label: "Close your eyes and sleep softly", teluguLabel: "కళ్ళు మూసుకుని హాయిగా నిద్రపోవడం", emoji: "😴", isCorrect: true },
      { id: "opt_play_drum", label: "Play loud drums in bed", teluguLabel: "గట్టిగా డ్రమ్స్ వాయించడం", emoji: "🥁", isCorrect: false },
      { id: "opt_run_outside", label: "Run outside in the dark", teluguLabel: "చీకట్లో బయటకు పరిగెత్తడం", emoji: "🏃", isCorrect: false },
    ],
  },
];

// ==========================================
// GAME 5: EVERYDAY SITUATION CHALLENGE
// ==========================================
export const everydaySituationData: EverydaySituation[] = [
  {
    id: "sit_thirsty",
    situation: "You played a fun game and your mouth feels very dry.",
    teluguSituation: "మీరు ఆడుకున్నారు, మీకు బాగా దాహం వేస్తోంది.",
    contextEmoji: "🥵",
    options: [
      {
        id: "ans_water",
        response: "Say: 'I want water, please' 💧",
        teluguResponse: "'దయచేసి నాకు నీళ్లు కావాలి' అని చెప్పండి 💧",
        emoji: "💧",
        isBest: true,
        feedback: "Wonderful! Asking for water keeps your body healthy and cool! ⭐",
      },
      {
        id: "ans_cry",
        response: "Keep quiet and feel upset",
        teluguResponse: "ఎవరికీ చెప్పకుండా మౌనంగా ఉండటం",
        emoji: "😔",
        isBest: false,
        feedback: "It is always okay to ask a parent or teacher for water! ♡",
      },
    ],
  },
  {
    id: "sit_help",
    situation: "Your jacket zipper is stuck and you cannot pull it up.",
    teluguSituation: "మీ జాకెట్ జిప్ చిక్కుకుంది, మీరు లాగలేకపోతున్నారు.",
    contextEmoji: "🧥",
    options: [
      {
        id: "ans_ask_help",
        response: "Show the picture: 'I need help, please' 🆘",
        teluguResponse: "'నాకు సహాయం కావాలి' కార్డు చూపించడం 🆘",
        emoji: "🙋",
        isBest: true,
        feedback: "Great job! Asking for help is brave and smart! 🌟",
      },
      {
        id: "ans_pull_hard",
        response: "Pull very hard until it tears",
        teluguResponse: "జిప్ చిరిగిపోయేలా గట్టిగా లాగడం",
        emoji: "😣",
        isBest: false,
        feedback: "Gentle asks protect your clothes. Asking for help is best! ♡",
      },
    ],
  },
  {
    id: "sit_noisy",
    situation: "The room is very loud with televisions and vacuums.",
    teluguSituation: "గదిలో టీవీ, వ్యాక్యూమ్ శబ్దాలు చాలా బిగ్గరగా ఉన్నాయి.",
    contextEmoji: "📢",
    options: [
      {
        id: "ans_quiet_space",
        response: "Point to: 'I need a quiet space' 🤫",
        teluguResponse: "'నాకు ప్రశాంతత కావాలి' అని చెప్పడం 🤫",
        emoji: "🌿",
        isBest: true,
        feedback: "Brilliant! Taking a break in a cozy corner feels so comforting! ☁️",
      },
      {
        id: "ans_shout",
        response: "Cover your ears and scream loudly",
        teluguResponse: "చెవులు మూసుకుని గట్టిగా అరవడం",
        emoji: "😫",
        isBest: false,
        feedback: "We can gently let people know we need a quiet break! ♡",
      },
    ],
  },
  {
    id: "sit_playground",
    situation: "You see children building sandcastles at the park.",
    teluguSituation: "పార్కులో పిల్లలు ఇసుక కోటలు కడుతున్నారు.",
    contextEmoji: "🏖️",
    options: [
      {
        id: "ans_play_together",
        response: "Smile and say: 'Can I play with you?' 🤝",
        teluguResponse: "'నేను మీతో ఆడుకోవచ్చా?' అని నవ్వుతూ అడగడం 🤝",
        emoji: "😊",
        isBest: true,
        feedback: "Friendly smiles and polite questions make new friends! 💖",
      },
      {
        id: "ans_kick_sand",
        response: "Kick the sandcastle over",
        teluguResponse: "ఇసుక కోటను కాలితో తన్నడం",
        emoji: "🦶",
        isBest: false,
        feedback: "Gentle hands keep play fun and safe for everyone! ♡",
      },
    ],
  },
  {
    id: "sit_spill",
    situation: "A little cup of juice tipped over on the table.",
    teluguSituation: "టేబుల్ మీద ఉన్న జ్యూస్ గ్లాసు ఒలికిపోయింది.",
    contextEmoji: "🧃",
    options: [
      {
        id: "ans_wipe",
        response: "Get a napkin and ask: 'Can we wipe this together?' 🧻",
        teluguResponse: "టిష్యూ పేపర్ తీసుకుని శుభ్రం చేయడానికి సహాయం అడగడం 🧻",
        emoji: "🧻",
        isBest: true,
        feedback: "Accidents happen! Cleaning up together is calm and responsible! ⭐",
      },
      {
        id: "ans_run_away",
        response: "Hide under the bed",
        teluguResponse: "మంచం కింద దాక్కోవడం",
        emoji: "🙈",
        isBest: false,
        feedback: "It's completely okay! Spills happen to everyone every day. ♡",
      },
    ],
  },
];
