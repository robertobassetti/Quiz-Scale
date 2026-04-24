// ======================
// CONFIGURAZIONE BASE
// ======================

const semitones = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];

const patterns = {
  major:    [2,2,1,2,2,2,1],
  minorNat: [2,1,2,2,1,2,2]
};

const majorEasyTonics = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
const minorEasyTonics = ["La", "Si", "Do#", "Re", "Mi", "Fa#", "Sol#"];

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

let currentTheme = localStorage.getItem('ruota-theme') || 'light';
if (currentTheme === 'dark') document.body.classList.add('dark-theme');

let gameHistory = [];

// ======================
// UTILITY SCALE
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
// UI BASE
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
const semitones=["Do","Do#","Re","Re#","Mi","Fa","Fa#","Sol","Sol#","La","La#","Si"],patterns={major:[2,2,1,2,2,2,1],minorNat:[2,1,2,2,1,2,2]},majorEasyTonics=["Do","Re","Mi","Fa","Sol","La","Si"],minorEasyTonics=["La","Si","Do#","Re","Mi","Fa#","Sol#"];let gameState={mode:"A",currentLevel:1,manualLevel:1,timePerExercise:30,score:0,correctInLevel:0,scoreCorrect:10,scoreFast:5,scoreWrong:-5,scoreTimeout:-10,gameMode:!1,gameRemaining:0,gameTotal:0,gameCorrect:0,playerName:"",trainingMode:!1},classModeEnabled=!1,classStudents=[],classRegister=[],correctScale=[],timerId=null,remainingTime=null,exerciseActive=!1,currentTheme=localStorage.getItem("ruota-theme")||"light";"dark"===currentTheme&&document.body.classList.add("dark-theme");let gameHistory=[];function buildScale(e,t){const n=semitones.indexOf(e),o=patterns[t];let r=[e],a=n;for(let e of o)a=(a+e)%12,r.push(semitones[a]);return r.slice(0,7)}const container=document.getElementById("circle-container"),notesDiv=document.getElementById("notes"),resultEl=document.getElementById("result"),intervalsEl=document.getElementById("intervals"),abstractEl=document.getElementById("abstract"),scoreEl=document.getElementById("score"),levelEl=document.getElementById("level"),timerEl=document.getElementById("timer"),settingsPanel=document.getElementById("settingsPanel"),overlay=document.getElementById("overlay"),resultsPanel=document.getElementById("gameResultsPanel"),resultsOverlay=document.getElementById("resultsOverlay"),resultsContent=document.getElementById("gameResultsContent"),resultsTitle=document.getElementById("resultsTitle"),downloadExcelBtn=document.getElementById("downloadExcel"),downloadClassExcelBtn=document.getElementById("downloadClassExcel"),manualLevelBox=document.getElementById("manualLevelBox"),trainingPanel=document.getElementById("trainingPanel"),trainingOverlay=document.getElementById("trainingOverlay"),trainingTonicSelect=document.getElementById("trainingTonic"),trainingModeSelect=document.getElementById("trainingMode"),toggleThemeBtn=document.getElementById("toggleTheme"),noteSound=document.getElementById("noteSound"),openClassModeBtn=document.getElementById("openClassMode"),classPanel=document.getElementById("classPanel"),classOverlay=document.getElementById("classOverlay"),classStudentsInput=document.getElementById("classStudentsInput"),saveClassStudentsBtn=document.getElementById("saveClassStudents"),closeClassPanelBtn=document.getElementById("closeClassPanel"),currentStudentSelect=document.getElementById("currentStudentSelect"),numSlots=7,radius=220,centerX=275,centerY=275;function createSlots(){container.innerHTML="";for(let e=0;e<numSlots;e++){const t=2*Math.PI/numSlots*e-Math.PI/2,n=centerX+radius*Math.cos(t)-60,o=centerY+radius*Math.sin(t)-60,r=document.createElement("div");r.classList.add("slot"),r.style.left=`${n}px`,r.style.top=`${o}px`,r.dataset.pos=e,container.appendChild(r)}}function createNotes(){notesDiv.innerHTML="",semitones.forEach(e=>{const t=document.createElement("div");t.classList.add("note"),t.textContent=e,t.draggable=!0,notesDiv.appendChild(t)}),enableDrag()}function startTimer(){if(clearTimer(),gameState.timePerExercise<=0)return timerEl.textContent="--",void(remainingTime=null);remainingTime=gameState.timePerExercise,timerEl.textContent=remainingTime,timerId=setInterval(()=>{remainingTime--,timerEl.textContent=remainingTime,remainingTime<=0&&(clearTimer(),handleTimeout())},1e3)}function clearTimer(){timerId&&(clearInterval(timerId),timerId=null)}document.getElementById("openSettings").addEventListener("click",()=>{settingsPanel.classList.add("open"),overlay.style.display="block"}),document.getElementById("closeSettings").addEventListener("click",()=>{settingsPanel.classList.remove("open"),overlay.style.display="none"}),overlay.addEventListener("click",()=>{settingsPanel.classList.remove("open"),overlay.style.display="none"}),document.getElementById("saveSettings").addEventListener("click",()=>{const e=document.querySelector('input[name="mode"]:checked').value,t=parseInt(document.getElementById("timeInput").value)||0,n=parseInt(document.getElementById("scoreCorrect").value)||0,o=parseInt(document.getElementById("scoreFast").value)||0,r=parseInt(document.getElementById("scoreWrong").value)||0,a=parseInt(document.getElementById("scoreTimeout").value)||0,c=parseInt(document.getElementById("manualLevel").value)||1,l=parseInt(document.getElementById("gameCount").value)||0;gameState.mode=e,gameState.timePerExercise=Math.max(0,t),gameState.scoreCorrect=n,gameState.scoreFast=o,gameState.scoreWrong=r,gameState.scoreTimeout=a,gameState.manualLevel=c,gameState.gameTotal=l,manualLevelBox.style.display="B"===e?"block":"none",settingsPanel.classList.remove("open"),overlay.style.display="none"});function getCurrentLevel(){return"A"===gameState.mode?gameState.currentLevel:gameState.manualLevel}function advanceLevelIfNeeded(){"A"===gameState.mode&&gameState.correctInLevel>=5&&gameState.currentLevel<3&&(gameState.currentLevel++,gameState.correctInLevel=0,levelEl.textContent=gameState.currentLevel,resultEl.textContent=`Bravo! Sei passato al livello ${gameState.currentLevel}.`)}function chooseTonicAndTypeForLevel(e){if(1===e){if(Math.random()<.5){const e=majorEasyTonics[Math.floor(Math.random()*majorEasyTonics.length)];return{tonic:e,type:"major"}}{const e=minorEasyTonics[Math.floor(Math.random()*minorEasyTonics.length)];return{tonic:e,type:"minorNat"}}}if(2===e||3===e){const e=semitones[Math.floor(Math.random()*semitones.length)],t=Math.random()<.5?"major":"minorNat";return{tonic:e,type:t}}return{tonic:"Do",type:"major"}}function removeTouchClone(){const e=document.querySelector(".touch-clone");e&&e.remove()}function newExercise(){removeTouchClone(),gameState.trainingMode=!1,exerciseActive=!0,clearTimer(),resultEl.textContent="",intervalsEl.textContent="",abstractEl.textContent="";const e=getCurrentLevel();levelEl.textContent=e;const t=chooseTonicAndTypeForLevel(e),n=t.tonic,o=t.type;correctScale=buildScale(n,o),createSlots(),createNotes();let r="major"===o?"maggiore":"minore naturale";if(resultEl.textContent=`Costruisci la scala di ${n} ${r}`,3===e){const e=document.querySelectorAll(".slot"),t=Math.floor(Math.random()*correctScale.length);e.forEach((e,n)=>{if(e.innerHTML="",n!==t){const t=document.createElement("div");t.textContent=correctScale[n],t.classList.add("note","fixed-note"),t.draggable=!1,e.appendChild(t)}}),resultEl.textContent+=" (inserisci la nota mancante)"}startTimer()}document.getElementById("newExercise").addEventListener("click",()=>{newExercise()});document.getElementById("startGame").addEventListener("click",()=>{if(gameState.gameTotal<=0)return void(resultEl.textContent="Imposta un numero valido di esercizi.");let e="";if(classModeEnabled&&currentStudentSelect.value)e=currentStudentSelect.value;else{const t=prompt("Inserisci il tuo nome:");e=t&&t.trim()?t.trim():"Giocatore"}gameState.playerName=e,gameState.gameMode=!0,gameState.trainingMode=!1,gameState.gameRemaining=gameState.gameTotal,gameState.gameCorrect=0,gameState.score=0,gameHistory=[],scoreEl.textContent=0,resultEl.textContent=`Modalità Game: ${gameState.gameTotal} esercizi per ${gameState.playerName}`,newExercise()});function nextGameExercise(){gameState.gameMode&&(gameState.gameRemaining--,gameState.gameRemaining<=0?(gameState.gameMode=!1,showGameResults()):newExercise())}document.getElementById("openTraining").addEventListener("click",()=>{trainingTonicSelect.innerHTML="",semitones.forEach(e=>{const t=document.createElement("option");t.value=e,t.textContent=e,trainingTonicSelect.appendChild(t)}),trainingPanel.style.display="block",trainingOverlay.style.display="block"}),document.getElementById("closeTraining").addEventListener("click",()=>{trainingPanel.style.display="none",trainingOverlay.style.display="none"}),trainingOverlay.addEventListener("click",()=>{trainingPanel.style.display="none",trainingOverlay.style.display="none"}),document.getElementById("startTrainingExercise").addEventListener("click",()=>{const e=trainingTonicSelect.value,t=trainingModeSelect.value;gameState.trainingMode=!0,gameState.gameMode=!1,exerciseActive=!0,clearTimer(),resultEl.textContent="",intervalsEl.textContent="",abstractEl.textContent="",correctScale=buildScale(e,t),createSlots(),createNotes();let n="major"===t?"maggiore":"minore naturale";resultEl.textContent=`Allenamento: costruisci la scala di ${e} ${n}`,trainingPanel.style.display="none",trainingOverlay.style.display="none",startTimer()});function enableDrag(){const e=document.querySelectorAll(".note"),t=document.querySelectorAll(".slot");let n=null,o=null;e.forEach(e=>{e.addEventListener("dragstart",e=>{n=e.target}),e.addEventListener("touchstart",e=>{e.preventDefault(),removeTouchClone(),n=e.target,o=n.cloneNode(!0),o.classList.add("touch-clone"),o.style.position="fixed",o.style.pointerEvents="none",o.style.opacity=".85",o.style.zIndex="9999",o.style.left=e.touches[0].clientX+"px",o.style.top=e.touches[0].clientY+"px",document.body.appendChild(o)}),e.addEventListener("touchmove",e=>{o&&(e.preventDefault(),o.style.left=e.touches[0].clientX+"px",o.style.top=e.touches[0].clientY+"px")}),e.addEventListener("touchend",e=>{if(!o)return;const t=e.changedTouches[0],r=document.elementFromPoint(t.clientX,t.clientY);r&&r.classList.contains("slot")&&(r.innerHTML="",r.appendChild(n),playNoteSound()),o.remove(),o=null,n=null}),e.addEventListener("touchcancel",()=>{o&&o.remove(),o=null,n=null})}),t.forEach(t=>{t.addEventListener("dragover",e=>e.preventDefault()),t.addEventListener("drop",e=>{e.preventDefault(),n&&(t.innerHTML="",t.appendChild(n),playNoteSound(),n=null)})})}document.getElementById("check").addEventListener("click",()=>{if(!exerciseActive)return void(resultEl.textContent="Premi prima 'Nuovo esercizio' o avvia Allenamento/Game.");const e=document.querySelectorAll(".slot");let t=[];if(e.forEach(e=>{t.push(e.textContent.trim())}),t.includes("")||7!==t.length)return resultEl.textContent="Inserisci tutte le 7 note prima di verificare.",intervalsEl.textContent="",void(abstractEl.textContent="");let n=!0;e.forEach((e,o)=>{t[o]===correctScale[o]?(e.classList.add("correct"),e.classList.remove("wrong")):(e.classList.add("wrong"),e.classList.remove("correct"),n=!1)});const o=gameState.score;if(clearTimer(),n){if(gameState.score+=gameState.scoreCorrect,gameState.timePerExercise>0&&null!==remainingTime){const e=gameState.timePerExercise-remainingTime;e<=gameState.timePerExercise/2&&(gameState.score+=gameState.scoreFast)}gameState.correctInLevel++,gameState.gameMode&&gameState.gameCorrect++,advanceLevelIfNeeded(),resultEl.textContent="Bravo! Scala corretta!"}else gameState.score+=gameState.scoreWrong,resultEl.textContent="Ci sono errori, riprova.";const r=gameState.score-o;scoreEl.textContent=gameState.score;let a=[],c=[];for(let e=0;e<t.length;e++){const n=t[e],o=t[(e+1)%7],r=semitones.indexOf(n),l=semitones.indexOf(o),s=(l-r+12)%12;a.push(`${n} → ${o}: ${s} semitoni`),c.push(1===s?"S":2===s?"T":s+"s")}intervalsEl.textContent=a.join(" | "),abstractEl.textContent=c.join("-"),gameState.gameMode&&gameHistory.push({player:gameState.playerName,tonic:correctScale[0],correct:n,scoreDelta:r,timestamp:(new Date).toISOString()}),classModeEnabled&&classRegister.push({student:gameState.playerName||"Anonimo",tonic:correctScale[0],correct:n,score:gameState.score,time:(new Date).toISOString()}),exerciseActive=!1,gameState.gameMode&&setTimeout(()=>nextGameExercise(),900)});function handleTimeout(){exerciseActive=!1,gameState.score+=gameState.scoreTimeout,scoreEl.textContent=gameState.score,resultEl.textContent="Tempo scaduto!",gameState.gameMode&&setTimeout(()=>nextGameExercise(),900)}function showGameResults(){resultsTitle.textContent=`Risultati di ${gameState.playerName}`,resultsContent.innerHTML="";const e=document.createElement("div");e.classList.add("resultBox"),e.innerHTML=`<strong>Punteggio finale:</strong> ${gameState.score}<br><strong>Corrette:</strong> ${gameState.gameCorrect} / ${gameState.gameTotal}`,resultsContent.appendChild(e),gameHistory.forEach(e=>{const t=document.createElement("div");t.classList.add("resultBox",e.correct?"correct":"wrong"),t.textContent=`${e.timestamp} — ${e.player} — ${e.tonic} — ${e.correct?"OK":"ERR"} — ${e.scoreDelta}`,resultsContent.appendChild(t)}),resultsPanel.classList.add("open"),resultsOverlay.style.display="block"}document.getElementById("closeResults").addEventListener("click",()=>{resultsPanel.classList.remove("open"),resultsOverlay.style.display="none"});function toCSV(e){return e.map(e=>Object.values(e).map(e=>`"${String(e).replace(/"/g,'""')}"`).join(",")).join("\n")}downloadExcelBtn.addEventListener("click",()=>{if(!gameHistory.length)return alert("Nessun risultato da scaricare.");const e="player,tonic,correct,scoreDelta,timestamp\n"+toCSV(gameHistory.map(e=>[e.player,e.tonic,e.correct,e.scoreDelta,e.timestamp])),t=new Blob([e],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(t),o=document.createElement("a");o.href=n,o.download=`ruota_scales_${(new Date).toISOString().slice(0,10)}.csv`,o.click(),URL.revokeObjectURL(n)}),downloadClassExcelBtn.addEventListener("click",()=>{if(!classRegister.length)return alert("Registro classe vuoto.");const e="student,tonic,correct,score,time\n"+toCSV(classRegister.map(e=>[e.student,e.tonic,e.correct,e.score,e.time])),t=new Blob([e],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(t),o=document.createElement("a");o.href=n,o.download=`registro_classe_${(new Date).toISOString().slice(0,10)}.csv`,o.click(),URL.revokeObjectURL(n)}),openClassModeBtn.addEventListener("click",()=>{classPanel.style.display="block",classOverlay.style.display="block"}),closeClassPanelBtn.addEventListener("click",()=>{classPanel.style.display="none",classOverlay.style.display="none"}),classOverlay.addEventListener("click",()=>{classPanel.style.display="none",classOverlay.style.display="none"}),saveClassStudentsBtn.addEventListener("click",()=>{const e=classStudentsInput.value.split("\n").map(e=>e.trim()).filter(Boolean);classStudents=e,currentStudentSelect.innerHTML='<option value="">(singolo giocatore)</option>',classStudents.forEach(e=>{const t=document.createElement("option");t.value=e,t.textContent=e,currentStudentSelect.appendChild(t)}),classModeEnabled=classStudents.length>0,classPanel.style.display="none",classOverlay.style.display="none"}),toggleThemeBtn.addEventListener("click",()=>{document.body.classList.toggle("dark-theme"),currentTheme=document.body.classList.contains("dark-theme")?"dark":"light",localStorage.setItem("ruota-theme",currentTheme)});function init(){createSlots(),createNotes(),levelEl.textContent=gameState.currentLevel,scoreEl.textContent=gameState.score,manualLevelBox.style.display="B"===gameState.mode?"block":"none"}init();
