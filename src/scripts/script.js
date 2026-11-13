/* =========================================
   SENSECALM - BEBBO INTERACTIONS
========================================= */


/* 1. FIRST-TIME WELCOME */

const welcomeScreen = document.getElementById("welcomeScreen");
const welcomeForm = document.getElementById("welcomeForm");
const visitorNameInput = document.getElementById("visitorName");

const savedName = localStorage.getItem("senseCalmVisitorName");

if (welcomeScreen && !savedName) {
    welcomeScreen.hidden = false;
}

if (welcomeForm) {
    welcomeForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const visitorName = visitorNameInput.value.trim();

        if (!visitorName) {
            visitorNameInput.focus();
            return;
        }

        localStorage.setItem("senseCalmVisitorName", visitorName);

        welcomeScreen.hidden = true;

        updateGreeting();

        const homeBunny = document.getElementById("homeBunny");

        if (homeBunny) {
            showBunnyGreeting(homeBunny);
            makeBunnyDance(homeBunny);
        }
    });
}


/* 2. UPDATE BEBBO'S GREETING */

function updateGreeting() {
    const visitorName =
        localStorage.getItem("senseCalmVisitorName");

    const homeGreeting = document.getElementById("homeGreeting");
    const activitiesGreeting =
        document.getElementById("activitiesGreeting");

    if (homeGreeting) {
        if (visitorName) {
            homeGreeting.textContent =
                `Hello ${visitorName}! Welcome to SenseCalm! I'm Bebbo! ♡`;
        } else {
            homeGreeting.textContent =
                "Hello, buddy! Welcome to SenseCalm! ♡";
        }
    }

    if (activitiesGreeting) {
        if (visitorName) {
            activitiesGreeting.textContent =
                `Hello ${visitorName}! What shall we explore today? ♡`;
        } else {
            activitiesGreeting.textContent =
                "Hello, buddy! What shall we explore today? ♡";
        }
    }
}

updateGreeting();


/* 3. BEBBO SPEECH BUBBLE */

function showBunnyGreeting(bunny) {
    const bubbleId = bunny.id === "homeBunny"
        ? "homeSpeech"
        : "activitiesSpeech";

    const bubble = document.getElementById(bubbleId);

    if (!bubble) return;

    const isAlreadyOpen = !bubble.hidden;

    if (isAlreadyOpen) {
        bubble.hidden = true;
        bunny.setAttribute("aria-expanded", "false");
    } else {
        bubble.hidden = false;
        bunny.setAttribute("aria-expanded", "true");
    }
}


/* 4. BEBBO DANCE */

function makeBunnyDance(bunny) {
    if (document.body.classList.contains("quiet-mode")) {
        return;
    }

    bunny.classList.remove("dancing");

    // Restart the animation
    void bunny.offsetWidth;

    bunny.classList.add("dancing");

    setTimeout(function () {
        bunny.classList.remove("dancing");
    }, 900);
}


/* 5. BEBBO CLICK EVENT */

const bunnies = document.querySelectorAll(".bunny");

bunnies.forEach(function (bunny) {
    bunny.addEventListener("click", function () {
        showBunnyGreeting(bunny);
        makeBunnyDance(bunny);
    });
});


/* 6. QUIET MODE - REMEMBER THE SETTING */

const settingsBtn = document.getElementById("settingsBtn");

function updateQuietMode(isQuiet) {
    document.body.classList.toggle("quiet-mode", isQuiet);

    if (settingsBtn) {
        settingsBtn.textContent = isQuiet
            ? "☁ Quiet Mode: On"
            : "☁ Quiet Mode: Off";

        settingsBtn.setAttribute(
            "aria-pressed",
            String(isQuiet)
        );
    }
}

const savedQuietMode =
    localStorage.getItem("senseCalmQuietMode") === "true";

updateQuietMode(savedQuietMode);

if (settingsBtn) {
    settingsBtn.addEventListener("click", function () {
        const isQuiet =
            !document.body.classList.contains("quiet-mode");

        localStorage.setItem(
            "senseCalmQuietMode",
            String(isQuiet)
        );

        updateQuietMode(isQuiet);
    });
}


/* 7. ACTIVITY CARD BOUNCE */

const activityCards =
    document.querySelectorAll(".activity-card");

function bounceCard(card) {
    if (document.body.classList.contains("quiet-mode")) {
        return;
    }

    card.classList.remove("bouncing");

    void card.offsetWidth;

    card.classList.add("bouncing");

    setTimeout(function () {
        card.classList.remove("bouncing");
    }, 600);
}

activityCards.forEach(function (card) {
    card.addEventListener("click", function () {
        bounceCard(card);
    });

    card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            bounceCard(card);
        }
    });
});


/* =========================================================
   SENSECALM EXTENSION
   Communication, Learning, Routines, Sensory Settings
   and Progress Tracking
========================================================= */

(() => {
    "use strict";

    const STORAGE = {
        progress: "senseCalmProgress",
        preferences: "senseCalmPreferences",
        routines: "senseCalmRoutines"
    };

    const defaults = {
        reducedMotion: false,
        muted: true,
        simplified: false,
        speechEnabled: false
    };

    const readJSON = (key, fallback) => {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value ?? fallback;
        } catch {
            return fallback;
        }
    };

    let preferences = {
        ...defaults,
        ...readJSON(STORAGE.preferences, {})
    };

    let progress = readJSON(STORAGE.progress, {
        completedActivities: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        communicationUses: 0,
        lastActiveDate: "",
        activityHistory: []
    });

    const routineItems = [
        "Brush my teeth",
        "Get dressed",
        "Have breakfast",
        "Pack my bag",
        "Take a little break",
        "Get ready for bed"
    ];

    let routines = readJSON(STORAGE.routines, {});
    let currentModule = "home";
    let learningTopic = "colours";
    let learningRound = 0;
    let currentQuestion = null;

    const save = () => {
        localStorage.setItem(
            STORAGE.progress,
            JSON.stringify(progress)
        );

        localStorage.setItem(
            STORAGE.preferences,
            JSON.stringify(preferences)
        );

        localStorage.setItem(
            STORAGE.routines,
            JSON.stringify(routines)
        );
    };

    const todayKey = () =>
        new Date().toISOString().slice(0, 10);

    function recordActivity(label) {
        progress.completedActivities += 1;
        progress.lastActiveDate = todayKey();

        progress.activityHistory.unshift({
            label,
            date: new Date().toLocaleString()
        });

        progress.activityHistory =
            progress.activityHistory.slice(0, 30);

        save();
    }

    function recordAnswer(isCorrect) {
        progress.totalAnswers += 1;

        if (isCorrect) {
            progress.correctAnswers += 1;
        }

        save();
    }

    /* Create the extension interface */

    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = "sensecalm-extension.css";

    document.head.appendChild(styleLink);

    const launcher = document.createElement("button");

    launcher.type = "button";
    launcher.className = "scx-communication-launcher";
    launcher.textContent = "💬 I need...";
    launcher.setAttribute(
        "aria-label",
        "Open communication board"
    );

    document.body.appendChild(launcher);

    const overlay = document.createElement("div");

    overlay.className = "scx-overlay";
    overlay.hidden = true;

    overlay.innerHTML = `
      <section class="scx-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scx-title"
        tabindex="-1">

        <header class="scx-header">
          <div>
            <p class="scx-eyebrow">SENSECALM</p>
            <h2 id="scx-title">Hello, buddy! ♡</h2>
          </div>

          <button class="scx-close"
            type="button"
            aria-label="Close">
            ×
          </button>
        </header>

        <nav class="scx-tabs" aria-label="SenseCalm tools">
          <button type="button"
            data-module="communication">
            💬 Communicate
          </button>

          <button type="button"
            data-module="learning">
            🌱 Learn
          </button>

          <button type="button"
            data-module="routine">
            🌷 My routine
          </button>

          <button type="button"
            data-module="sensory">
            ☁ Comfort
          </button>

          <button type="button"
            data-module="progress">
            ⭐ Progress
          </button>
        </nav>

        <main class="scx-content" id="scx-content"></main>

        <p class="scx-footer">
          You can stop or take a break whenever you need. ♡
        </p>

      </section>
    `;

    document.body.appendChild(overlay);

    const content = overlay.querySelector("#scx-content");
    const dialog = overlay.querySelector(".scx-dialog");
    const title = overlay.querySelector("#scx-title");

    function openModule(moduleName) {
        currentModule = moduleName;

        overlay.hidden = false;

        document.body.classList.add("scx-modal-open");

        overlay.querySelectorAll("[data-module]")
            .forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.module === moduleName
                );
            });

        const titles = {
            communication: "What would you like to say? ♡",
            learning: "Let's learn together! 🌱",
            routine: "My little daily steps 🌷",
            sensory: "Make this space comfortable ☁",
            progress: "Look how far you've come! ⭐"
        };

        title.textContent =
            titles[moduleName] || "SenseCalm ♡";

        renderModule();
        dialog.focus();
    }

    function closeModule() {
        overlay.hidden = true;

        document.body.classList.remove("scx-modal-open");
    }

    function speak(text) {
        if (!preferences.speechEnabled || preferences.muted) {
            return;
        }

        if (!("speechSynthesis" in window)) {
            showNotice(
                "Speech is not available in this browser."
            );
            return;
        }

        window.speechSynthesis.cancel();

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.rate = 0.85;
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    }

    function showNotice(message) {
        const notice = document.createElement("div");

        notice.className = "scx-notice";
        notice.textContent = message;

        content.prepend(notice);

        window.setTimeout(() => notice.remove(), 2800);
    }

    /* =====================================================
       1. COMMUNICATION BOARD
    ===================================================== */

    function renderCommunication() {

        const messages = [
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
            ["👍", "I am okay"]
        ];

        content.innerHTML = `
          <p class="scx-intro">
            Choose a picture or message.
            Your choice will appear below.
          </p>

          <div class="scx-message-grid">

            ${messages.map(([emoji, phrase], index) => `
              <button class="scx-message"
                type="button"
                data-message="${index}">

                <span>${emoji}</span>
                <strong>${phrase}</strong>

              </button>
            `).join("")}

          </div>

          <div class="scx-selected" aria-live="polite">

            <span class="scx-selected-label">
              MY MESSAGE
            </span>

            <p id="scx-selected-text">
              Choose a message above.
            </p>

            <button class="scx-primary"
              id="scx-say-message"
              type="button"
              disabled>
              🔊 Speak message
            </button>

          </div>
        `;

        let selectedMessage = "";

        content.querySelectorAll("[data-message]")
            .forEach(button => {

                button.addEventListener("click", () => {

                    selectedMessage =
                        messages[
                            Number(button.dataset.message)
                        ][1];

                    content.querySelector(
                        "#scx-selected-text"
                    ).textContent = selectedMessage;

                    content.querySelector(
                        "#scx-say-message"
                    ).disabled = false;

                    progress.communicationUses += 1;

                    save();

                    speak(selectedMessage);
                });
            });

        content.querySelector(
            "#scx-say-message"
        ).addEventListener("click", () => {

            if (selectedMessage) {

                if (
                    preferences.speechEnabled &&
                    !preferences.muted
                ) {
                    speak(selectedMessage);
                } else {
                    showNotice(
                        "Turn on optional speech in Comfort settings to hear this message."
                    );
                }
            }
        });
    }

    /* =====================================================
       2. INTERACTIVE LEARNING ACTIVITIES
    ===================================================== */

    const questions = {

        colours: [
            {
                prompt: "Find the RED colour",
                choices: [
                    "🔴 Red",
                    "🔵 Blue",
                    "🟡 Yellow"
                ],
                answer: 0
            },
            {
                prompt: "Find the BLUE colour",
                choices: [
                    "🟢 Green",
                    "🔵 Blue",
                    "🟣 Purple"
                ],
                answer: 1
            },
            {
                prompt: "Find the YELLOW colour",
                choices: [
                    "🟠 Orange",
                    "🔴 Red",
                    "🟡 Yellow"
                ],
                answer: 2
            }
        ],

        numbers: [
            {
                prompt: "Which number comes after 1?",
                choices: ["3", "2", "4"],
                answer: 1
            },
            {
                prompt: "How many stars? ⭐ ⭐ ⭐",
                choices: ["2", "4", "3"],
                answer: 2
            },
            {
                prompt: "Choose number 5",
                choices: ["5", "2", "1"],
                answer: 0
            }
        ],

        shapes: [
            {
                prompt: "Which one is a circle?",
                choices: [
                    "🔺 Triangle",
                    "⚪ Circle",
                    "🟦 Square"
                ],
                answer: 1
            },
            {
                prompt: "Which one is a triangle?",
                choices: [
                    "🔺 Triangle",
                    "🟡 Circle",
                    "🟥 Square"
                ],
                answer: 0
            },
            {
                prompt: "Which one is a square?",
                choices: [
                    "⭐ Star",
                    "⚪ Circle",
                    "🟦 Square"
                ],
                answer: 2
            }
        ]
    };

    function renderLearning() {

        content.innerHTML = `
          <p class="scx-intro">
            Choose a topic. There is no rush.
            Try one question at a time.
          </p>

          <div class="scx-topic-row">

            <button type="button" data-topic="colours">
              🎨 Colours
            </button>

            <button type="button" data-topic="numbers">
              🔢 Numbers
            </button>

            <button type="button" data-topic="shapes">
              🔷 Shapes
            </button>

          </div>

          <section class="scx-question-card">

            <p class="scx-eyebrow">
              QUESTION ${learningRound + 1}
            </p>

            <h3 id="scx-question"></h3>

            <div class="scx-answer-list"
              id="scx-answers">
            </div>

            <p id="scx-feedback"
              class="scx-feedback"
              aria-live="polite">
            </p>

            <button type="button"
              class="scx-primary"
              id="scx-next-question">
              Next question →
            </button>

          </section>
        `;

        content.querySelectorAll("[data-topic]")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.topic === learningTopic
                );

                button.addEventListener("click", () => {

                    learningTopic = button.dataset.topic;
                    learningRound = 0;

                    renderLearning();
                });
            });

        const set = questions[learningTopic];

        currentQuestion =
            set[learningRound % set.length];

        content.querySelector(
            "#scx-question"
        ).textContent = currentQuestion.prompt;

        const answers =
            content.querySelector("#scx-answers");

        currentQuestion.choices.forEach(
            (choice, index) => {

                const button =
                    document.createElement("button");

                button.type = "button";
                button.className = "scx-answer";
                button.textContent = choice;

                button.addEventListener("click", () => {

                    if (
                        answers.dataset.answered === "true"
                    ) {
                        return;
                    }

                    answers.dataset.answered = "true";

                    const correct =
                        index === currentQuestion.answer;

                    recordAnswer(correct);

                    content.querySelector(
                        "#scx-feedback"
                    ).textContent = correct
                        ? "Wonderful! You got it! ⭐"
                        : "Good try! Let's learn together. ♡";

                    button.classList.add(
                        correct ? "correct" : "try-again"
                    );

                    if (correct) {
                        recordActivity(
                            `Learning: ${learningTopic}`
                        );
                    }

                    answers.querySelectorAll("button")
                        .forEach(item => {
                            item.disabled = true;
                        });
                });

                answers.appendChild(button);
            }
        );

        content.querySelector(
            "#scx-next-question"
        ).addEventListener("click", () => {

            learningRound =
                (learningRound + 1) % set.length;

            renderLearning();
        });
    }

    /* =====================================================
       3. DAILY ROUTINE TRACKING
    ===================================================== */

    function renderRoutine() {

        const key = todayKey();

        if (!Array.isArray(routines[key])) {
            routines[key] = [];
        }

        content.innerHTML = `
          <p class="scx-intro">
            Tick the steps you have done today.
            Choose the steps that matter to you.
          </p>

          <div class="scx-routine-list">

            ${routineItems.map((item, index) => `
              <label class="scx-routine-item">

                <input type="checkbox"
                  data-routine="${index}"
                  ${routines[key].includes(index)
                    ? "checked"
                    : ""}>

                <span>${item}</span>

              </label>
            `).join("")}

          </div>

          <p class="scx-routine-count"
            id="scx-routine-count">
          </p>

          <button class="scx-primary"
            id="scx-routine-save"
            type="button">
            Save today's routine
          </button>
        `;

        const updateCount = () => {

            const count =
                content.querySelectorAll(
                    "[data-routine]:checked"
                ).length;

            content.querySelector(
                "#scx-routine-count"
            ).textContent =
                `${count} of ${routineItems.length} steps completed today`;
        };

        content.querySelectorAll("[data-routine]")
            .forEach(input => {
                input.addEventListener(
                    "change",
                    updateCount
                );
            });

        updateCount();

        content.querySelector(
            "#scx-routine-save"
        ).addEventListener("click", () => {

            routines[key] = [
                ...content.querySelectorAll(
                    "[data-routine]:checked"
                )
            ].map(input =>
                Number(input.dataset.routine)
            );

            save();

            recordActivity("Daily routine");

            showNotice(
                "Your routine has been saved. Well done! ♡"
            );

            updateCount();
        });
    }

    /* =====================================================
       4. SENSORY SETTINGS
    ===================================================== */

    function renderSensory() {

        content.innerHTML = `
          <p class="scx-intro">
            Choose what feels comfortable.
            Your preferences are saved on this device.
          </p>

          <div class="scx-settings-list">

            <label class="scx-setting">
              <span>
                <strong>Reduce animations</strong>
                <small>
                  Limit moving effects on this page.
                </small>
              </span>

              <input type="checkbox"
                id="scx-motion"
                ${preferences.reducedMotion ? "checked" : ""}>
            </label>

            <label class="scx-setting">
              <span>
                <strong>Mute optional speech</strong>
                <small>
                  Keep spoken messages turned off.
                </small>
              </span>

              <input type="checkbox"
                id="scx-muted"
                ${preferences.muted ? "checked" : ""}>
            </label>

            <label class="scx-setting">
              <span>
                <strong>Simplified layout</strong>
                <small>
                  Use a calmer, less decorated view.
                </small>
              </span>

              <input type="checkbox"
                id="scx-simple"
                ${preferences.simplified ? "checked" : ""}>
            </label>

            <label class="scx-setting">
              <span>
                <strong>Enable spoken messages</strong>
                <small>
                  Uses your browser's text-to-speech voice
                  when unmuted.
                </small>
              </span>

              <input type="checkbox"
                id="scx-speech"
                ${preferences.speechEnabled ? "checked" : ""}>
            </label>

          </div>

          <button class="scx-primary"
            id="scx-save-preferences"
            type="button">
            Save comfort settings
          </button>

          <button class="scx-break"
            id="scx-take-break"
            type="button">
            🌿 I want a break
          </button>
        `;

        content.querySelector(
            "#scx-save-preferences"
        ).addEventListener("click", () => {

            preferences.reducedMotion =
                content.querySelector(
                    "#scx-motion"
                ).checked;

            preferences.muted =
                content.querySelector(
                    "#scx-muted"
                ).checked;

            preferences.simplified =
                content.querySelector(
                    "#scx-simple"
                ).checked;

            preferences.speechEnabled =
                content.querySelector(
                    "#scx-speech"
                ).checked;

            applyPreferences();

            save();

            showNotice(
                "Your comfort settings are saved. ♡"
            );
        });

        content.querySelector(
            "#scx-take-break"
        ).addEventListener("click", () => {

            content.innerHTML = `
              <div class="scx-break-screen">

                <div aria-hidden="true">🌿</div>

                <h3>It's okay to pause.</h3>

                <p>
                  Take a few quiet moments.
                  You can come back whenever you feel ready.
                </p>

                <button class="scx-primary"
                  id="scx-back-from-break"
                  type="button">
                  I'm ready to come back
                </button>

              </div>
            `;

            content.querySelector(
                "#scx-back-from-break"
            ).addEventListener("click", renderSensory);
        });
    }

    /* =====================================================
       5. PROGRESS DASHBOARD
    ===================================================== */

    function renderProgress() {

        const accuracy = progress.totalAnswers
            ? Math.round(
                (progress.correctAnswers /
                progress.totalAnswers) * 100
              )
            : 0;

        const today = routines[todayKey()] || [];

        content.innerHTML = `
          <p class="scx-intro">
            This progress is stored locally on this device.
            Ask a parent or teacher before sharing it.
          </p>

          <div class="scx-stat-grid">

            <div class="scx-stat">
              <strong>${progress.completedActivities}</strong>
              <span>Activities completed</span>
            </div>

            <div class="scx-stat">
              <strong>${progress.communicationUses}</strong>
              <span>Messages selected</span>
            </div>

            <div class="scx-stat">
              <strong>${accuracy}%</strong>
              <span>Practice accuracy</span>
            </div>

            <div class="scx-stat">
              <strong>${today.length}/${routineItems.length}</strong>
              <span>Today's routine steps</span>
            </div>

          </div>

          <h3 class="scx-section-title">
            Recent activity
          </h3>

          <ul class="scx-history">

            ${
                progress.activityHistory.length
                ? progress.activityHistory
                    .slice(0, 8)
                    .map(item => `
                      <li>
                        <span>${escapeHTML(item.label)}</span>
                        <small>${escapeHTML(item.date)}</small>
                      </li>
                    `).join("")
                : "<li>No activities recorded yet. Try a learning activity!</li>"
            }

          </ul>

          <p class="scx-privacy-note">
            This is a basic on-device progress view,
            not a secure parent/teacher account system.
            Do not use it to store sensitive personal information.
          </p>

          <button class="scx-break"
            id="scx-export-progress"
            type="button">
            Download progress summary
          </button>
        `;

        content.querySelector(
            "#scx-export-progress"
        ).addEventListener("click", exportProgress);
    }

    function escapeHTML(value) {

        return String(value).replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[character]
        );
    }

    function exportProgress() {

        const report = {
            generatedAt: new Date().toLocaleString(),

            completedActivities:
                progress.completedActivities,

            correctAnswers:
                progress.correctAnswers,

            totalAnswers:
                progress.totalAnswers,

            communicationUses:
                progress.communicationUses,

            routineToday:
                (routines[todayKey()] || [])
                    .map(index => routineItems[index]),

            recentActivity:
                progress.activityHistory
        };

        const blob = new Blob(
            [JSON.stringify(report, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "sensecalm-progress.json";

        link.click();

        URL.revokeObjectURL(url);
    }

    /* =====================================================
       MODULE CONTROLLER
    ===================================================== */

    function renderModule() {

        if (currentModule === "communication") {
            renderCommunication();
        }

        if (currentModule === "learning") {
            renderLearning();
        }

        if (currentModule === "routine") {
            renderRoutine();
        }

        if (currentModule === "sensory") {
            renderSensory();
        }

        if (currentModule === "progress") {
            renderProgress();
        }
    }

    function applyPreferences() {

        document.body.classList.toggle(
            "scx-reduced-motion",
            preferences.reducedMotion
        );

        document.body.classList.toggle(
            "scx-simplified",
            preferences.simplified
        );

        document.documentElement.dataset.scxMuted =
            String(preferences.muted);
    }

    applyPreferences();

    /* =====================================================
       EVENT LISTENERS
    ===================================================== */

    launcher.addEventListener("click", () => {
        openModule("communication");
    });

    overlay.querySelector(
        ".scx-close"
    ).addEventListener("click", closeModule);

    overlay.addEventListener("click", event => {

        if (event.target === overlay) {
            closeModule();
        }
    });

    overlay.querySelectorAll("[data-module]")
        .forEach(button => {

            button.addEventListener("click", () => {
                openModule(button.dataset.module);
            });
        });

    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            !overlay.hidden
        ) {
            closeModule();
        }
    });

    /* Connect existing activity cards */

    const cardModules = [
        [".fundamentals-card", "learning"],
        [".games-card", "learning"],
        [".routines-card", "routine"]
    ];

    cardModules.forEach(([selector, moduleName]) => {

        document.querySelectorAll(selector)
            .forEach(card => {

                card.addEventListener("click", () => {
                    openModule(moduleName);
                });

                card.addEventListener("keydown", event => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {
                        event.preventDefault();
                        openModule(moduleName);
                    }
                });
            });
    });

    save();

})();
