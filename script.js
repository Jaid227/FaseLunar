
// ======================= DATOS REALES DE FASES ==================
const PHASES = [
    { name: "Luna Nueva", icon: "🌑", illumination: 0, daysRange: [0, 1.5], order: 0 },
    { name: "Creciente", icon: "🌒", illumination: 0.1, daysRange: [1.5, 5], order: 1 },
    { name: "Cuarto Creciente", icon: "🌓", illumination: 0.5, daysRange: [5, 8], order: 2 },
    { name: "Gibosa Creciente", icon: "🌔", illumination: 0.75, daysRange: [8, 11.5], order: 3 },
    { name: "Luna Llena", icon: "🌕", illumination: 1, daysRange: [11.5, 18], order: 4 },
    { name: "Gibosa Menguante", icon: "🌖", illumination: 0.75, daysRange: [18, 21.5], order: 5 },
    { name: "Cuarto Menguante", icon: "🌗", illumination: 0.5, daysRange: [21.5, 25], order: 6 },
    { name: "Menguante", icon: "🌘", illumination: 0.1, daysRange: [25, 29.5], order: 7 }
];

// Helper: obtener fase según día real
function getPhaseByDay(day) {
    let d = day % 29.5;
    for (let phase of PHASES) {
        if (d >= phase.daysRange[0] && d < phase.daysRange[1]) return phase;
    }
    return PHASES[0];
}

// ========== 1. QUIZ (preguntas reales) ==========
const quizData = [
    { question: "¿Cuál es la fase que tiene iluminación 0%?", correct: "Luna Nueva", options: ["Luna Nueva", "Creciente", "Luna Llena", "Menguante"] },
    { question: "¿Qué fase ocurre aproximadamente en el día 14 del ciclo?", correct: "Luna Llena", options: ["Cuarto Creciente", "Luna Llena", "Gibosa Menguante", "Creciente"] },
    { question: "Después de Cuarto Creciente, ¿qué fase sigue?", correct: "Gibosa Creciente", options: ["Luna Llena", "Gibosa Creciente", "Cuarto Menguante", "Creciente"] },
    { question: "¿Cuántos días dura aproximadamente el ciclo lunar completo?", correct: "29.5 días", options: ["27.3 días", "29.5 días", "30 días", "31 días"] },
    { question: "¿Qué fase muestra un 50% de iluminación y está creciendo?", correct: "Cuarto Creciente", options: ["Cuarto Creciente", "Cuarto Menguante", "Gibosa Creciente", "Creciente"] }
];

let quizCurrent = 0, quizScore = 0, quizTotal = quizData.length;
let quizAnswered = false;

function renderQuiz() {
    document.getElementById("quizScore").innerText = quizScore;
    document.getElementById("quizTotal").innerText = quizTotal;
    if (quizCurrent >= quizTotal) {
        document.getElementById("quizQuestion").innerHTML = `<h3>🏆 ¡Completaste el quiz! Puntaje final: ${quizScore}/${quizTotal}</h3>`;
        document.getElementById("quizOptions").innerHTML = "";
        document.getElementById("nextQuizBtn").style.display = "none";
        return;
    }
    const q = quizData[quizCurrent];
    document.getElementById("quizQuestion").innerHTML = `<strong>${q.question}</strong>`;
    let optsHtml = "";
    q.options.forEach(opt => {
        optsHtml += `<div class="quiz-option" data-opt="${opt}">${opt}</div>`;
    });
    document.getElementById("quizOptions").innerHTML = optsHtml;
    document.querySelectorAll(".quiz-option").forEach(optDiv => {
        optDiv.addEventListener("click", () => handleQuizAnswer(optDiv.dataset.opt));
    });
    document.getElementById("nextQuizBtn").style.display = "block";
    document.getElementById("quizFeedback").innerHTML = "";
    quizAnswered = false;
}

function handleQuizAnswer(selected) {
    if (quizAnswered) return;
    quizAnswered = true;
    const correct = quizData[quizCurrent].correct;
    if (selected === correct) {
        quizScore++;
        document.getElementById("quizFeedback").innerHTML = "<span style='color:#a3ffa3'>✅ ¡Correcto!</span>";
    } else {
        document.getElementById("quizFeedback").innerHTML = `<span style='color:#ffb3a3'>❌ Incorrecto. Respuesta: ${correct}</span>`;
    }
    document.getElementById("quizScore").innerText = quizScore;
    document.querySelectorAll(".quiz-option").forEach(btn => btn.style.pointerEvents = "none");
}
document.getElementById("nextQuizBtn").addEventListener("click", () => {
    if (!quizAnswered && quizCurrent < quizTotal) {
        document.getElementById("quizFeedback").innerHTML = "<span style='color:orange'>Responde primero</span>";
        return;
    }
    quizCurrent++;
    renderQuiz();
});
renderQuiz();

// ========== 2. MEMORAMA (Parejas icono + nombre) ==========
let memoramaCards = [];
let flippedCards = [], lockBoard = false, matchedPairs = 0;
const totalPairs = 8;
function buildMemorama() {
    let deck = [];
    PHASES.forEach((phase, idx) => {
        deck.push({ id: idx * 2, phaseId: idx, type: "icon", value: phase.icon, name: phase.name });
        deck.push({ id: idx * 2 + 1, phaseId: idx, type: "name", value: phase.name, name: phase.name });
    });
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    memoramaCards = deck;
    matchedPairs = 0;
    flippedCards = [];
    lockBoard = false;
    document.getElementById("pairsFound").innerText = matchedPairs;
    renderMemoramaGrid();
}
function renderMemoramaGrid() {
    const grid = document.getElementById("memoramaGrid");
    grid.innerHTML = "";
    memoramaCards.forEach((card, idx) => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("mem-card");
        if (card.matched) cardDiv.classList.add("matched");
        if (card.flipped) cardDiv.classList.add("flipped");
        cardDiv.innerHTML = card.flipped ? (card.type === "icon" ? card.value : `<span style="font-size:1rem;">${card.value}</span>`) : "❓";
        cardDiv.addEventListener("click", () => flipCard(idx));
        grid.appendChild(cardDiv);
    });
}
function flipCard(index) {
    if (lockBoard) return;
    const card = memoramaCards[index];
    if (card.flipped || card.matched) return;
    card.flipped = true;
    flippedCards.push(index);
    renderMemoramaGrid();
    if (flippedCards.length === 2) {
        lockBoard = true;
        checkMatch();
    }
}
function checkMatch() {
    const cardA = memoramaCards[flippedCards[0]];
    const cardB = memoramaCards[flippedCards[1]];
    const isMatch = (cardA.phaseId === cardB.phaseId);
    if (isMatch) {
        cardA.matched = true;
        cardB.matched = true;
        matchedPairs++;
        document.getElementById("pairsFound").innerText = matchedPairs;
        flippedCards = [];
        lockBoard = false;
        renderMemoramaGrid();
        if (matchedPairs === totalPairs) document.getElementById("memoramaMsg").innerHTML = "🎉 ¡Ganaste! Memorama completo 🎉";
    } else {
        setTimeout(() => {
            cardA.flipped = false;
            cardB.flipped = false;
            flippedCards = [];
            lockBoard = false;
            renderMemoramaGrid();
        }, 800);
    }
}
document.getElementById("resetMemorama").addEventListener("click", () => {
    buildMemorama();
    document.getElementById("memoramaMsg").innerHTML = "";
});
buildMemorama();

// ========== 3. ORDEN LUNAR ==========
let ordenPhases = [...PHASES].sort(() => Math.random() - 0.5);
let ordenSlots = new Array(8).fill(null);
function renderOrden() {
    const slotsContainer = document.getElementById("ordenSlots");
    const itemsContainer = document.getElementById("ordenItems");
    slotsContainer.innerHTML = "";
    ordenSlots.forEach((phase, idx) => {
        const slotDiv = document.createElement("div");
        slotDiv.className = "orden-slot" + (phase === null ? " empty" : "");
        if (phase) {
            slotDiv.innerHTML = `<span>${phase.icon}</span><span>${phase.name}</span>`;
            slotDiv.addEventListener("click", () => removeFromSlot(idx));
        } else {
            slotDiv.innerHTML = `<span>⬜ Vacío ${idx+1}</span>`;
        }
        slotsContainer.appendChild(slotDiv);
    });
    itemsContainer.innerHTML = "";
    ordenPhases.forEach((phase, idx) => {
        const item = document.createElement("div");
        item.className = "orden-item";
        item.innerHTML = `<span>${phase.icon}</span><span>${phase.name}</span>`;
        item.addEventListener("click", () => addToSlot(phase, idx));
        itemsContainer.appendChild(item);
    });
}
function addToSlot(phase, phaseIdx) {
    const firstEmpty = ordenSlots.findIndex(slot => slot === null);
    if (firstEmpty !== -1) {
        ordenSlots[firstEmpty] = phase;
        ordenPhases.splice(phaseIdx, 1);
        renderOrden();
    } else {
        document.getElementById("ordenFeedback").innerHTML = "⚠️ Ya no hay espacios vacíos, reinicia o elimina alguno.";
    }
}
function removeFromSlot(slotIdx) {
    const phase = ordenSlots[slotIdx];
    if (phase) {
        ordenSlots[slotIdx] = null;
        ordenPhases.push(phase);
        renderOrden();
    }
}
document.getElementById("checkOrdenBtn").addEventListener("click", () => {
    let correct = true;
    for (let i = 0; i < ordenSlots.length; i++) {
        if (!ordenSlots[i] || ordenSlots[i].order !== i) {
            correct = false;
            break;
        }
    }
    if (correct && ordenSlots.every(s => s !== null)) document.getElementById("ordenFeedback").innerHTML = "✨ ¡Orden perfecto! Conoces las fases ✨";
    else document.getElementById("ordenFeedback").innerHTML = "❌ El orden no es correcto, recuerda: Nueva → Creciente → Cuarto Creciente → Gibosa Creciente → Llena → Gibosa Menguante → Cuarto Menguante → Menguante.";
});
document.getElementById("resetOrdenBtn").addEventListener("click", () => {
    ordenPhases = [...PHASES].sort(() => Math.random() - 0.5);
    ordenSlots = new Array(8).fill(null);
    renderOrden();
    document.getElementById("ordenFeedback").innerHTML = "";
});
renderOrden();

// ========== 4. RELOJ LUNAR ==========
document.getElementById("guessPhaseBtn").addEventListener("click", () => {
    let day = parseFloat(document.getElementById("lunarDay").value);
    if (isNaN(day)) day = 0;
    const phase = getPhaseByDay(day);
    document.getElementById("relojResult").innerHTML = `<span style="font-size:3rem;">${phase.icon}</span><br><strong>${phase.name}</strong><br>Iluminación: ${Math.round(phase.illumination*100)}%`;
    document.getElementById("relojFeedback").innerHTML = `🌙 Día ${day.toFixed(1)} → ${phase.name}`;
});

// ========== 5. SOPA DE LETRAS (temática fases) ==========
const words = ["NUEVA", "CRECIENTE", "CUARTO", "LLENA", "GIBOSA", "MENGUANTE"];
let sopaGrid = [], selectedCells = [], foundWords = [];
function generateSopa() {
    const rows = 10, cols = 10;
    sopaGrid = Array(rows).fill().map(() => Array(cols).fill(''));
    for(let i=0;i<rows;i++) for(let j=0;j<cols;j++) sopaGrid[i][j]=String.fromCharCode(65+Math.floor(Math.random()*26));
    // insertar palabras (simplificado, se asegura presencia)
    words.forEach((word, idx) => {
        let placed = false;
        for(let intent=0;intent<100;intent++){
            let row = Math.floor(Math.random()*rows);
            let col = Math.floor(Math.random()*(cols-word.length+1));
            let ok=true;
            for(let k=0;k<word.length;k++) if(sopaGrid[row][col+k]!==' ' && sopaGrid[row][col+k]!==word[k]) ok=false;
            if(ok){
                for(let k=0;k<word.length;k++) sopaGrid[row][col+k]=word[k];
                placed=true; break;
            }
        }
        if(!placed){
            for(let k=0;k<word.length;k++) sopaGrid[idx%rows][k]=word[k];
        }
    });
    renderSopa();
    foundWords=[];
    selectedCells=[];
    document.getElementById("palabrasRestantes").innerText = words.length;
}
function renderSopa(){
    const container = document.getElementById("sopaGrid");
    container.innerHTML="";
    for(let i=0;i<sopaGrid.length;i++){
        for(let j=0;j<sopaGrid[0].length;j++){
            const cell = document.createElement("div");
            cell.classList.add("sopa-cell");
            if(selectedCells.some(cellCoord=>cellCoord.row===i && cellCoord.col===j)) cell.classList.add("selected");
            cell.textContent = sopaGrid[i][j];
            cell.addEventListener("click",()=>toggleSelectCell(i,j));
            container.appendChild(cell);
        }
    }
}
function toggleSelectCell(row,col){
    const idx = selectedCells.findIndex(c=>c.row===row && c.col===col);
    if(idx===-1) selectedCells.push({row,col});
    else selectedCells.splice(idx,1);
    renderSopa();
    checkWordFound();
}
function checkWordFound(){
    let selectedStr = selectedCells.sort((a,b)=>a.col-b.col).map(c=>sopaGrid[c.row][c.col]).join('');
    let reverseStr = selectedCells.slice().reverse().map(c=>sopaGrid[c.row][c.col]).join('');
    for(let w of words){
        if(!foundWords.includes(w) && (selectedStr===w || reverseStr===w)){
            foundWords.push(w);
            document.getElementById("palabrasRestantes").innerText = words.length - foundWords.length;
            document.getElementById("sopaFeedback").innerHTML = `✔️ Encontraste: ${w}`;
            selectedCells=[];
            renderSopa();
            if(foundWords.length===words.length) document.getElementById("sopaFeedback").innerHTML = "🎉 ¡Sopa completada! 🎉";
            return;
        }
    }
}
document.getElementById("resetSopaBtn").addEventListener("click",()=>{ generateSopa(); selectedCells=[]; foundWords=[]; document.getElementById("sopaFeedback").innerHTML=""; });
generateSopa();

// ========== NAVEGACIÓN ENTRE JUEGOS ==========
const panels = {
    quiz: document.getElementById("quizGame"),
    memorama: document.getElementById("memoramaGame"),
    orden: document.getElementById("ordenGame"),
    reloj: document.getElementById("relojGame"),
    sopa: document.getElementById("sopaGame")
};
document.querySelectorAll(".game-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const gameId = btn.dataset.game;
        document.querySelectorAll(".game-panel").forEach(panel => panel.classList.remove("active"));
        panels[gameId].classList.add("active");
        document.querySelectorAll(".game-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});