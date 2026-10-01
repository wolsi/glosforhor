// ========================================
// GLOSFÖRHÖR
// ========================================

let selectedUser = "";
let selectedLanguage = "";
let selectedList = "";

let words = [];
let currentWordIndex = 0;
let score = 0;
let answered = false;


// ========================================
// HJÄLPFUNKTIONER
// ========================================

function showSection(sectionId) {
    const sections = [
        "user-selection",
        "language-selection",
        "list-selection",
        "quiz",
        "result"
    ];

    sections.forEach(id => {
        document.getElementById(id).classList.add("hidden");
    });

    document.getElementById(sectionId).classList.remove("hidden");
}


// ========================================
// VÄLJ PERSON
// ========================================

function selectUser(user) {

    selectedUser = user;

    showSection("language-selection");
}


// ========================================
// VÄLJ SPRÅK
// ========================================

function selectLanguage(language) {

    selectedLanguage = language;

    loadLists();
}


// ========================================
// LADDA GLOSLISTOR
// ========================================

async function loadLists() {

    const listButtons = document.getElementById("list-buttons");

    listButtons.innerHTML = "";

    const basePath =
        `glosor/${selectedUser}/${selectedLanguage}/`;

    // Våra listor
    const lists = [
        {
            file: "verb.json",
            name: "Verb"
        },
        {
            file: "nyhetsord.json",
            name: "Nyhetsord"
        }
    ];

    lists.forEach(list => {

        const button = document.createElement("button");

        button.textContent = list.name;

        button.onclick = () => {
            startQuiz(list.file, list.name);
        };

        listButtons.appendChild(button);
    });

    showSection("list-selection");
}


// ========================================
// STARTA GLOSFÖRHÖR
// ========================================

async function startQuiz(file, listName) {

    selectedList = listName;

    const path =
        `glosor/${selectedUser}/${selectedLanguage}/${file}`;

    try {

        const response = await fetch(path);

        if (!response.ok) {
            throw new Error("Kunde inte läsa gloslistan.");
        }

        words = await response.json();

        if (words.length === 0) {
            alert("Den här gloslistan är tom.");
            return;
        }

        // Blanda glosorna
        words = shuffleArray(words);

        currentWordIndex = 0;
        score = 0;

        showSection("quiz");

        showCurrentWord();

    } catch (error) {

        console.error(error);

        alert(
            "Något gick fel när gloslistan skulle laddas."
        );
    }
}


// ========================================
// VISA AKTUELL GLOSA
// ========================================

function showCurrentWord() {

    answered = false;

    const wordElement =
        document.getElementById("word");

    const answerInput =
        document.getElementById("answer");

    const feedback =
        document.getElementById("feedback");

    const nextButton =
        document.getElementById("next-word");

    const submitButton =
        document.getElementById("submit-answer");

    const progress =
        document.getElementById("quiz-progress");


    // Visa glosan
    wordElement.textContent =
        words[currentWordIndex].foreign;


    // Rensa tidigare svar
    answerInput.value = "";

    feedback.textContent = "";

    nextButton.classList.add("hidden");

    submitButton.classList.remove("hidden");

    answerInput.disabled = false;


    // Visa framsteg
    progress.textContent =
        `Glosa ${currentWordIndex + 1} av ${words.length}`;

    // Placera markören i textrutan
    answerInput.focus();
}


// ========================================
// KONTROLLERA SVAR
// ========================================

function checkAnswer() {

    if (answered) {
        return;
    }

    const answerInput =
        document.getElementById("answer");

    const feedback =
        document.getElementById("feedback");

    const submitButton =
        document.getElementById("submit-answer");

    const nextButton =
        document.getElementById("next-word");


    const userAnswer =
        answerInput.value.trim().toLowerCase();

    const correctAnswer =
        words[currentWordIndex].swedish
            .trim()
            .toLowerCase();


    if (userAnswer === "") {

        feedback.textContent =
            "Skriv ett svar först.";

        return;
    }


    answered = true;

    answerInput.disabled = true;

    submitButton.classList.add("hidden");

    nextButton.classList.remove("hidden");


    if (userAnswer === correctAnswer) {

        score++;

        feedback.textContent =
            "✓ Rätt!";

    } else {

        feedback.textContent =
            `✗ Fel. Rätt svar är: ${words[currentWordIndex].swedish}`;

    }
}


// ========================================
// NÄSTA GLOSA
// ========================================

function nextWord() {

    currentWordIndex++;

    if (currentWordIndex >= words.length) {

        showResult();

        return;
    }

    showCurrentWord();
}


// ========================================
// VISA RESULTAT
// ========================================

function showResult() {

    showSection("result");

    const resultText =
        document.getElementById("result-text");

    const percentage =
        Math.round((score / words.length) * 100);

    resultText.textContent =
        `Du fick ${score} av ${words.length} rätt (${percentage} %).`;
}


// ========================================
// GÖR OM SAMMA FÖRHÖR
// ========================================

function restartQuiz() {

    words = shuffleArray(words);

    currentWordIndex = 0;

    score = 0;

    showSection("quiz");

    showCurrentWord();
}


// ========================================
// BÖRJA OM FRÅN BÖRJAN
// ========================================

function restartFromBeginning() {

    selectedUser = "";
    selectedLanguage = "";
    selectedList = "";

    words = [];

    currentWordIndex = 0;

    score = 0;

    showSection("user-selection");
}


// ========================================
// TILLBAKA TILL PERSONVAL
// ========================================

function goBackToUsers() {

    selectedUser = "";
    selectedLanguage = "";

    showSection("user-selection");
}


// ========================================
// TILLBAKA TILL SPRÅKVAL
// ========================================

function goBackToLanguages() {

    selectedLanguage = "";

    showSection("language-selection");
}


// ========================================
// BLANDA EN ARRAY
// ========================================

function shuffleArray(array) {

    const shuffled = [...array];

    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];
    }

    return shuffled;
}


// ========================================
// ENTER-TANGENTEN
// ========================================

document
    .getElementById("answer")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            if (answered) {

                nextWord();

            } else {

                checkAnswer();

            }
        }

    });
