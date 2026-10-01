// ========================================
// GLOSFÖRHÖR
// ========================================

let selectedUser = "";
let selectedLanguage = "";
let selectedList = "";
let selectedFile = "";
let selectedDirection = "";

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
        "direction-selection",
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

    const listButtons =
        document.getElementById("list-buttons");

    listButtons.innerHTML = "";

    const path =
        `glosor/${selectedUser}/${selectedLanguage}/lists.json`;

    try {

        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(
                "Kunde inte läsa listorna."
            );
        }

        const lists = await response.json();


        if (lists.length === 0) {

            listButtons.innerHTML =
                "<p>Det finns inga gloslistor ännu.</p>";

            showSection("list-selection");

            return;
        }


        lists.forEach(list => {

            const button =
                document.createElement("button");

            button.textContent =
                list.name;

            button.onclick = () => {

                selectedList =
                    list.name;

                selectedFile =
                    list.file;

                showSection(
                    "direction-selection"
                );
            };

            listButtons.appendChild(button);
        });


        showSection("list-selection");

    } catch (error) {

        console.error(error);

        alert(
            "Något gick fel när gloslistorna skulle laddas."
        );
    }
}


// ========================================
// VÄLJ RIKTNING
// ========================================

function selectDirection(direction) {

    selectedDirection = direction;

    startQuiz(selectedFile, selectedList);
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
            throw new Error(
                "Kunde inte läsa gloslistan."
            );
        }

        words = await response.json();

        if (words.length === 0) {

            alert(
                "Den här gloslistan är tom."
            );

            return;
        }

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


    // ------------------------------------
    // VISA ORD BEROENDE PÅ RIKTNING
    // ------------------------------------

    if (
        selectedDirection ===
        "foreign-to-swedish"
    ) {

        wordElement.textContent =
            words[currentWordIndex].foreign;

        answerInput.placeholder =
            "Skriv den svenska översättningen";

    } else {

        wordElement.textContent =
            words[currentWordIndex].swedish;

        answerInput.placeholder =
            "Skriv översättningen";
    }


    // ------------------------------------
    // Rensa tidigare svar
    // ------------------------------------

    answerInput.value = "";

    feedback.textContent = "";

    nextButton.classList.add("hidden");

    submitButton.classList.remove("hidden");

    answerInput.disabled = false;


    // ------------------------------------
    // Visa framsteg
    // ------------------------------------

    progress.textContent =
        `Glosa ${currentWordIndex + 1} av ${words.length}`;


    // ------------------------------------
    // Placera markören i textrutan
    // ------------------------------------

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
        answerInput.value
            .trim()
            .toLowerCase();


    if (userAnswer === "") {

        feedback.textContent =
            "Skriv ett svar först.";

        return;
    }


    // ------------------------------------
    // Hämta rätt svar
    // ------------------------------------

    let correctAnswer;

    if (
        selectedDirection ===
        "foreign-to-swedish"
    ) {

        correctAnswer =
            words[currentWordIndex]
                .swedish
                .trim()
                .toLowerCase();

    } else {

        correctAnswer =
            words[currentWordIndex]
                .foreign
                .trim()
                .toLowerCase();
    }


    // ------------------------------------
    // Lås frågan
    // ------------------------------------

    answered = true;

    answerInput.disabled = true;

    submitButton.classList.add("hidden");

    nextButton.classList.remove("hidden");


    // ------------------------------------
    // Kontrollera svaret
    // ------------------------------------

    if (userAnswer === correctAnswer) {

        score++;

        feedback.textContent =
            "✓ Rätt!";

    } else {

        const correctAnswerDisplay =
            selectedDirection ===
            "foreign-to-swedish"
                ? words[currentWordIndex].swedish
                : words[currentWordIndex].foreign;

        feedback.textContent =
            `✗ Fel. Rätt svar är: ${correctAnswerDisplay}`;
    }
}


// ========================================
// NÄSTA GLOSA
// ========================================

function nextWord() {

    currentWordIndex++;

    if (
        currentWordIndex >=
        words.length
    ) {

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
        Math.round(
            (score / words.length) * 100
        );

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
    selectedFile = "";
    selectedDirection = "";

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
    selectedList = "";
    selectedFile = "";
    selectedDirection = "";

    showSection("user-selection");
}


// ========================================
// TILLBAKA TILL SPRÅKVAL
// ========================================

function goBackToLanguages() {

    selectedLanguage = "";
    selectedList = "";
    selectedFile = "";
    selectedDirection = "";

    showSection("language-selection");
}


// ========================================
// TILLBAKA TILL GLOSLISTOR
// ========================================

function goBackToLists() {

    selectedList = "";
    selectedFile = "";
    selectedDirection = "";

    showSection("list-selection");
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
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            shuffled[i],
            shuffled[j]
        ] = [
            shuffled[j],
            shuffled[i]
        ];
    }

    return shuffled;
}


// ========================================
// ENTER-TANGENTEN
// ========================================

document
    .getElementById("answer")
    .addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                if (answered) {

                    nextWord();

                } else {

                    checkAnswer();
                }
            }
        }
    );
