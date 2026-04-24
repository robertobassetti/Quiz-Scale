// ======================
// CONFIGURAZIONE BASE
// ======================

const semitones = ["Do","Do#","Re","Re#","Mi","Fa","Fa#","Sol","Sol#","La","La#","Si"];

const patterns = {
  major:    [2,2,1,2,2,2,1],
  minorNat: [2,1,2,2,1,2,2]
};

const majorEasyTonics = ["Do","Re","Mi","Fa","Sol","La","Si"];
const minorEasyTonics = ["La","Si","Do#","Re","Mi","Fa#","Sol#"];

let gameState = {
  mode: "A",
  currentLevel: 1,
  manualLevel: 1,
  timePerExercise: 30,
  score: 0,
  correctInLevel: 0,
  scoreCorrect: 10,
  scoreFast: 5,
  scoreWrong: -5,
  scoreTimeout: -10,
  gameMode: false,
  gameRemaining: 0,
  gameTotal: 0,
  gameCorrect: 0,
  playerName: "",
  trainingMode: false
};

let classModeEnabled = false;
let classStudents = [];
let classRegister = [];

let correctScale = [];
let timerId = null;
let remainingTime = null;
let exerciseActive = false;

let currentTheme = localStorage.getItem("ruota-theme") || "light";
if (currentTheme === "dark") document.body.classList.add("dark-theme");

let gameHistory = [];

// ======================
// COSTRUZIONE SCALE
// ======================

function buildScale(tonic, type) {
  const start = semitones.indexOf(tonic);
  const steps = patterns[type];
  let scale = [tonic];
  let index = start;

  for (let step of steps) {
    index = (index + step) % 12;
    scale.push(semitones[index]);
  }

  return scale.slice(0, 7);
}

// ======================
// UI ELEMENTS
// ======================

const container = document.getElementById("circle-container");
const notesDiv = document.getElementById("notes");
const resultEl = document.getElementById("result");
const intervalsEl = document.getElementById("intervals");
const abstractEl = document.getElementById("abstract");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const timerEl = document.getElementById("timer");

const settingsPanel = document.getElementById("settingsPanel");
const overlay = document.getElementById("overlay");

const resultsPanel = document.getElementById("gameResultsPanel");
const resultsOverlay = document.getElementById("resultsOverlay");
const resultsContent = document.getElementById("gameResultsContent");
const resultsTitle = document.getElementById("resultsTitle");
const downloadExcelBtn = document.getElementById("downloadExcel");
const downloadClassExcelBtn = document.getElementById("downloadClassExcel");

const manualLevelBox = document.getElementById("manualLevelBox");

const trainingPanel = document.getElementById("trainingPanel");
const trainingOverlay = document.getElementById("trainingOverlay");
const trainingTonicSelect = document.getElementById("trainingTonic");
const trainingModeSelect = document.getElementById("trainingMode");

const toggleThemeBtn = document.getElementById("toggleTheme");
const noteSound = document.getElementById("noteSound");

const openClassModeBtn = document.getElementById("openClassMode");
const classPanel = document.getElementById("classPanel");
const classOverlay = document.getElementById("classOverlay");
const classStudentsInput = document.getElementById("classStudentsInput");
const saveClassStudentsBtn = document.getElementById("saveClassStudents");
const closeClassPanelBtn = document.getElementById("closeClassPanel");
const currentStudentSelect = document.getElementById("currentStudentSelect");

// ======================
// CERCHIO SCALE
// ======================

const numSlots = 7;
const radius = 220;
const centerX = 275;
const centerY = 275;

function createSlots() {
  container.innerHTML = "";
  for (let i = 0; i < numSlots; i++) {
    const angle = (2 * Math.PI / numSlots) * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle) - 60;
    const y = centerY + radius * Math.sin(angle) - 60;

    const slot = document.createElement("div");
    slot.classList.add("slot");
    slot.style.left = `${x}px`;
    slot.style.top = `${y}px`;
    slot.dataset.pos = i;

    container.appendChild(slot);
  }
}

function createNotes() {
  notesDiv.innerHTML = "";
  semitones.forEach(n => {
    const note = document.createElement("div");
    note.classList.add("note");
    note.textContent = n;
    note.draggable = true;
    notesDiv.appendChild(note);
  });
  enableDrag();
}

// ======================
// TIMER
// ======================

function startTimer() {
  clearTimer();
  if (gameState.timePerExercise <= 0) {
    timerEl.textContent = "--";
    remainingTime = null;
    return;
  }
  remainingTime = gameState.timePerExercise;
  timerEl.textContent = remainingTime;
  timerId = setInterval(() => {
    remainingTime--;
    timerEl.textContent = remainingTime;
    if (remainingTime <= 0) {
      clearTimer();
      handleTimeout();
    }
  }, 1000);
}

function clearTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}
// ======================
// IMPOSTAZIONI
// ======================

document.getElementById("openSettings").addEventListener("click", () => {
  settingsPanel.classList.add("open");
  overlay.style.display = "block";
});

document.getElementById("closeSettings").addEventListener("click", () => {
  settingsPanel.classList.remove("open");
  overlay.style.display = "none";
});

overlay.addEventListener("click", () => {
  settingsPanel.classList.remove("open");
  overlay.style.display = "none";
});

document.getElementById("saveSettings").addEventListener("click", () => {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const timeInput = parseInt(document.getElementById("timeInput").value) || 0;
  const scoreCorrect = parseInt(document.getElementById("scoreCorrect").value) || 0;
  const scoreFast = parseInt(document.getElementById("scoreFast").value) || 0;
  const scoreWrong = parseInt(document.getElementById("scoreWrong").value) || 0;
  const scoreTimeout = parseInt(document.getElementById("scoreTimeout").value) || 0;
  const manualLevel = parseInt(document.getElementById("manualLevel").value) || 1;
  const gameN = parseInt(document.getElementById("gameCount").value) || 0;

  gameState.mode = mode;
  gameState.timePerExercise = Math.max(0, timeInput);
  gameState.scoreCorrect = scoreCorrect;
  gameState.scoreFast = scoreFast;
  gameState.scoreWrong = scoreWrong;
  gameState.scoreTimeout = scoreTimeout;
  gameState.manualLevel = manualLevel;
  gameState.gameTotal = gameN;

  manualLevelBox.style.display = (mode === "B") ? "block" : "none";

  settingsPanel.classList.remove("open");
  overlay.style.display = "none";
});

// ======================
// LOGICA LIVELLI
// ======================

function getCurrentLevel() {
  return (gameState.mode === "A") ? gameState.currentLevel : gameState.manualLevel;
}

function advanceLevelIfNeeded() {
  if (gameState.mode !== "A") return;
  if (gameState.correctInLevel >= 5 && gameState.currentLevel < 3) {
    gameState.currentLevel++;
    gameState.correctInLevel = 0;
    levelEl.textContent = gameState.currentLevel;
    resultEl.textContent = `Bravo! Sei passato al livello ${gameState.currentLevel}.`;
  }
}

// ======================
// SCELTA TONICA E TIPO PER LIVELLO
// ======================

function chooseTonicAndTypeForLevel(level) {
  if (level === 1) {
    const isMajor = Math.random() < 0.5;
    if (isMajor) {
      const t = majorEasyTonics[Math.floor(Math.random() * majorEasyTonics.length)];
      return { tonic: t, type: "major" };
    } else {
      const t = minorEasyTonics[Math.floor(Math.random() * minorEasyTonics.length)];
      return { tonic: t, type: "minorNat" };
    }
  }

  if (level === 2 || level === 3) {
    const tonic = semitones[Math.floor(Math.random() * semitones.length)];
    const type = Math.random() < 0.5 ? "major" : "minorNat";
    return { tonic, type };
  }

  return { tonic: "Do", type: "major" };
}

// ======================
// GENERAZIONE ESERCIZIO
// ======================

function newExercise() {
  removeTouchClone(); // ← patch iPad: elimina eventuali cloni rimasti

  gameState.trainingMode = false;
  exerciseActive = true;
  clearTimer();
  resultEl.textContent = "";
  intervalsEl.textContent = "";
  abstractEl.textContent = "";

  const level = getCurrentLevel();
  levelEl.textContent = level;

  const choice = chooseTonicAndTypeForLevel(level);
  const tonic = choice.tonic;
  const type = choice.type;

  correctScale = buildScale(tonic, type);

  createSlots();
  createNotes();

  let tipoTesto = (type === "major") ? "maggiore" : "minore naturale";
  resultEl.textContent = `Costruisci la scala di ${tonic} ${tipoTesto}`;

  // Livello 3: una nota mancante
  if (level === 3) {
    const slots = document.querySelectorAll(".slot");
    const missingIndex = Math.floor(Math.random() * correctScale.length);

    slots.forEach((slot, i) => {
      slot.innerHTML = "";
      if (i !== missingIndex) {
        const fixed = document.createElement("div");
        fixed.textContent = correctScale[i];
        fixed.classList.add("note", "fixed-note");
        fixed.draggable = false;
        slot.appendChild(fixed);
      }
    });

    resultEl.textContent += " (inserisci la nota mancante)";
  }

  startTimer();
}

document.getElementById("newExercise").addEventListener("click", () => {
  newExercise();
});

// ======================
// MODALITÀ GAME
// ======================

document.getElementById("startGame").addEventListener("click", () => {
  if (gameState.gameTotal <= 0) {
    resultEl.textContent = "Imposta un numero valido di esercizi.";
    return;
  }

  let playerName = "";

  if (classModeEnabled && currentStudentSelect.value) {
    playerName = currentStudentSelect.value;
  } else {
    const name = prompt("Inserisci il tuo nome:");
    playerName = (name && name.trim()) ? name.trim() : "Giocatore";
  }

  gameState.playerName = playerName;

  gameState.gameMode = true;
  gameState.trainingMode = false;
  gameState.gameRemaining = gameState.gameTotal;
  gameState.gameCorrect = 0;
  gameState.score = 0;
  gameHistory = [];

  scoreEl.textContent = 0;

  resultEl.textContent = `Modalità Game: ${gameState.gameTotal} esercizi per ${gameState.playerName}`;
  newExercise();
});

function nextGameExercise() {
  if (!gameState.gameMode) return;

  gameState.gameRemaining--;

  if (gameState.gameRemaining <= 0) {
    gameState.gameMode = false;
    showGameResults();
    return;
  }

  newExercise();
}

// ======================
// MODALITÀ ALLENAMENTO
// ======================

document.getElementById("openTraining").addEventListener("click", () => {
  trainingTonicSelect.innerHTML = "";
  semitones.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    trainingTonicSelect.appendChild(opt);
  });

  trainingPanel.style.display = "block";
  trainingOverlay.style.display = "block";
});

document.getElementById("closeTraining").addEventListener("click", () => {
  trainingPanel.style.display = "none";
  trainingOverlay.style.display = "none";
});

trainingOverlay.addEventListener("click", () => {
  trainingPanel.style.display = "none";
  trainingOverlay.style.display = "none";
});

document.getElementById("startTrainingExercise").addEventListener("click", () => {
  const tonic = trainingTonicSelect.value;
  const type = trainingModeSelect.value;

  gameState.trainingMode = true;
  gameState.gameMode = false;
  exerciseActive = true;
  clearTimer();
  resultEl.textContent = "";
  intervalsEl.textContent = "";
  abstractEl.textContent = "";

  correctScale = buildScale(tonic, type);

  createSlots();
  createNotes();

  let tipoTesto = (type === "major") ? "maggiore" : "minore naturale";
  resultEl.textContent = `Allenamento: costruisci la scala di ${tonic} ${tipoTesto}`;

  trainingPanel.style.display = "none";
  trainingOverlay.style.display = "none";

  startTimer();
});
// ======================
// TOUCH + DESKTOP DRAG & DROP (VERSIONE STABILE iPad/iPhone/Android)
// ======================

// Rimuove eventuali cloni rimasti sullo schermo
function removeTouchClone() {
  const oldClone = document.querySelector(".touch-clone");
  if (oldClone) oldClone.remove();
}

function enableDrag() {
  const notes = document.querySelectorAll(".note");
  const slots = document.querySelectorAll(".slot");

  let draggedEl = null;
  let cloneEl = null;

  // Disabilita lo scroll durante il drag (Safari otherwise duplicates)
  function disableScroll() {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }

  function enableScroll() {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }

  function cleanupClone() {
    if (cloneEl) cloneEl.remove();
    cloneEl = null;
    draggedEl = null;
    enableScroll();
  }

  // Se Safari perde il focus → rimuovi clone
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cleanupClone();
  });

  notes.forEach(note => {

    // --- DESKTOP DRAG ---
    note.addEventListener("dragstart", e => {
      draggedEl = e.target;
    });

    // --- TOUCH START ---
    note.addEventListener("touchstart", e => {
      e.preventDefault();
      cleanupClone();
      disableScroll();

      draggedEl = e.target;

      cloneEl = draggedEl.cloneNode(true);
      cloneEl.classList.add("touch-clone");
      cloneEl.style.position = "fixed";
      cloneEl.style.pointerEvents = "none";
      cloneEl.style.opacity = "0.85";
      cloneEl.style.zIndex = "9999";
      cloneEl.style.left = e.touches[0].clientX + "px";
      cloneEl.style.top = e.touches[0].clientY + "px";

      document.body.appendChild(cloneEl);
    });

    // --- TOUCH MOVE ---
    note.addEventListener("touchmove", e => {
      if (!cloneEl) return;
      e.preventDefault();

      cloneEl.style.left = e.touches[0].clientX + "px";
      cloneEl.style.top = e.touches[0].clientY + "px";
    });

    // --- TOUCH END ---
    note.addEventListener("touchend", e => {
      if (!cloneEl) return;

      const touch = e.changedTouches[0];
      const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

      if (dropTarget && dropTarget.classList.contains("slot")) {
        dropTarget.innerHTML = "";
        dropTarget.appendChild(draggedEl);
        playNoteSound();
      }

      cleanupClone();
    });

    // --- TOUCH CANCEL (Safari lo usa spesso) ---
    note.addEventListener("touchcancel", cleanupClone);

    // --- POINTER CANCEL (iPadOS 17+) ---
    note.addEventListener("pointercancel", cleanupClone);
  });

  // --- DESKTOP DROP ---
  slots.forEach(slot => {
    slot.addEventListener("dragover", e => e.preventDefault());
    slot.addEventListener("drop", e => {
      e.preventDefault();
      if (!draggedEl) return;
      slot.innerHTML = "";
      slot.appendChild(draggedEl);
      playNoteSound();
      draggedEl = null;
    });
  });
}

  // --- DESKTOP DROP ---
  slots.forEach(slot => {
    slot.addEventListener("dragover", e => e.preventDefault());
    slot.addEventListener("drop", e => {
      e.preventDefault();
      if (!draggedEl) return;
      slot.innerHTML = "";
      slot.appendChild(draggedEl);
      playNoteSound();
      draggedEl = null;
    });
  });
}

// ======================
// VERIFICA
// ======================

document.getElementById("check").addEventListener("click", () => {
  if (!exerciseActive) {
    resultEl.textContent = "Premi prima 'Nuovo esercizio' o avvia Allenamento/Game.";
    return;
  }

  const slots = document.querySelectorAll(".slot");
  let userScale = [];

  slots.forEach(slot => {
    userScale.push(slot.textContent.trim());
  });

  if (userScale.includes("") || userScale.length !== 7) {
    resultEl.textContent = "Inserisci tutte le 7 note prima di verificare.";
    intervalsEl.textContent = "";
    abstractEl.textContent = "";
    return;
  }

  let correct = true;
  slots.forEach((slot, i) => {
    if (userScale[i] === correctScale[i]) {
      slot.classList.add("correct");
      slot.classList.remove("wrong");
    } else {
      slot.classList.add("wrong");
      slot.classList.remove("correct");
      correct = false;
    }
  });

  const prevScore = gameState.score;

  clearTimer();

  if (correct) {
    gameState.score += gameState.scoreCorrect;

    if (gameState.timePerExercise > 0 && remainingTime !== null) {
      const elapsed = gameState.timePerExercise - remainingTime;
      if (elapsed <= gameState.timePerExercise / 2) {
        gameState.score += gameState.scoreFast;
      }
    }

    gameState.correctInLevel++;
    if (gameState.gameMode) gameState.gameCorrect++;

    advanceLevelIfNeeded();
    resultEl.textContent = "Bravo! Scala corretta!";
  } else {
    gameState.score += gameState.scoreWrong;
    resultEl.textContent = "Ci sono errori, riprova.";
  }

  const deltaScore = gameState.score - prevScore;
  scoreEl.textContent = gameState.score;

  let stepLines = [];
  let abstractPattern = [];

  for (let i = 0; i < userScale.length; i++) {
    const note1 = userScale[i];
    const note2 = userScale[(i + 1) % 7];

    const idx1 = semitones.indexOf(note1);
    const idx2 = semitones.indexOf(note2);

    let dist = (idx2 - idx1 + 12) % 12;
    stepLines.push(`${note1} → ${note2}: ${dist} semitoni`);
    abstractPattern.push(dist === 1 ? "S" : dist === 2 ? "T" : dist + "s");
  }

  intervalsEl.textContent = stepLines.join(" | ");
  abstractEl.textContent = abstractPattern.join("-");

  if (gameState.gameMode) {
    gameHistory.push({
      player: gameState.playerName,
      tonic: correctScale[0],
      correct: correct,
      scoreDelta: deltaScore,
      timestamp: new Date().toISOString()
    });
  }

  if (classModeEnabled) {
    classRegister.push({
      student: gameState.playerName || "Anonimo",
      tonic: correctScale[0],
      correct,
      score: gameState.score,
      time: new Date().toISOString()
    });
  }

  exerciseActive = false;

  if (gameState.gameMode) {
    setTimeout(() => nextGameExercise(), 900);
  }
});

// ======================
// TIMEOUT HANDLER
// ======================

function handleTimeout() {
  exerciseActive = false;
  gameState.score += gameState.scoreTimeout;
  scoreEl.textContent = gameState.score;
  resultEl.textContent = "Tempo scaduto!";
  if (gameState.gameMode) {
    setTimeout(() => nextGameExercise(), 900);
  }
}

// ======================
// RISULTATI GAME / EXPORT
// ======================

function showGameResults() {
  resultsTitle.textContent = `Risultati di ${gameState.playerName}`;
  resultsContent.innerHTML = "";

  const summary = document.createElement("div");
  summary.classList.add("resultBox");
  summary.innerHTML = `<strong>Punteggio finale:</strong> ${gameState.score}<br>
                       <strong>Corrette:</strong> ${gameState.gameCorrect} / ${gameState.gameTotal}`;
  resultsContent.appendChild(summary);

  gameHistory.forEach(h => {
    const box = document.createElement("div");
    box.classList.add("resultBox", h.correct ? "correct" : "wrong");
    box.textContent = `${h.timestamp} — ${h.player} — ${h.tonic} — ${h.correct ? "OK" : "ERR"} — ${h.scoreDelta}`;
    resultsContent.appendChild(box);
  });

  resultsPanel.classList.add("open");
  resultsOverlay.style.display = "block";
}

document.getElementById("closeResults").addEventListener("click", () => {
  resultsPanel.classList.remove("open");
  resultsOverlay.style.display = "none";
});

// ======================
// CSV EXPORT
// ======================

function toCSV(rows) {
  return rows
    .map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

downloadExcelBtn.addEventListener("click", () => {
  if (!gameHistory.length) return alert("Nessun risultato da scaricare.");
  const csv =
    "player,tonic,correct,scoreDelta,timestamp\n" +
    toCSV(gameHistory.map(h => [h.player, h.tonic, h.correct, h.scoreDelta, h.timestamp]));
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ruota_scales_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

downloadClassExcelBtn.addEventListener("click", () => {
  if (!classRegister.length) return alert("Registro classe vuoto.");
  const csv =
    "student,tonic,correct,score,time\n" +
    toCSV(classRegister.map(r => [r.student, r.tonic, r.correct, r.score, r.time]));
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `registro_classe_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// ======================
// MODALITÀ CLASSE
// ======================

openClassModeBtn.addEventListener("click", () => {
  classPanel.style.display = "block";
  classOverlay.style.display = "block";
});

closeClassPanelBtn.addEventListener("click", () => {
  classPanel.style.display = "none";
  classOverlay.style.display = "none";
});

classOverlay.addEventListener("click", () => {
  classPanel.style.display = "none";
  classOverlay.style.display = "none";
});

saveClassStudentsBtn.addEventListener("click", () => {
  const lines = classStudentsInput.value.split("\n").map(l => l.trim()).filter(Boolean);
  classStudents = lines;

  currentStudentSelect.innerHTML = '<option value="">(singolo giocatore)</option>';
  classStudents.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    currentStudentSelect.appendChild(opt);
  });

  classModeEnabled = classStudents.length > 0;
  classPanel.style.display = "none";
  classOverlay.style.display = "none";
});

// ======================
// TEMA
// ======================

toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  currentTheme = document.body.classList.contains("dark-theme") ? "dark" : "light";
  localStorage.setItem("ruota-theme", currentTheme);
});

// ======================
// INIZIALIZZAZIONE
// ======================

function init() {
  createSlots();
  createNotes();
  levelEl.textContent = gameState.currentLevel;
  scoreEl.textContent = gameState.score;
  manualLevelBox.style.display = (gameState.mode === "B") ? "block" : "none";
}

init();
