// Cloud Tetris — App shell (navigation, input, softkeys)

const GAME_NAME = "Cloud Tetris";
const GAME_VERSION = "1.0.0";
const GAME_DEVELOPER = "Tasmon Islam";

const MODES = [
  { id: "marathon", name: "Marathon", desc: "Endless play, speed climbs with level" },
  { id: "sprint", name: "Sprint 40", desc: "Clear 40 lines as fast as you can" },
  { id: "ultra", name: "Ultra 2:00", desc: "Highest score inside 2 minutes" }
];

let state = {
  screen: "menu",
  selectedMode: "marathon",
  selectedTheme: "nokia",
  menuIndex: { menu: 0, mode: 0, theme: 0 }
};

const el = id => document.getElementById(id);
const boardCanvas = el("board");
const nextCanvas = el("nextCanvas");
const game = new Game(boardCanvas, nextCanvas);

// ---------- Screen bookkeeping ----------

const SOFTKEYS = {
  menu: { l: "Select", r: "Exit" },
  mode: { l: "Select", r: "Back" },
  theme: { l: "Select", r: "Back" },
  game: { l: "Menu", r: "Pause" },
  pause: { l: "Resume", r: "Quit" },
  gameover: { l: "Retry", r: "Menu" },
  help: { l: " ", r: "Back" },
  about: { l: " ", r: "Back" }
};

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  el("screen-" + name).classList.add("active");
  state.screen = name;
  const sk = SOFTKEYS[name];
  el("lsk").textContent = sk.l;
  el("rsk").textContent = sk.r;
}

// ---------- Build menu lists ----------

function buildList(container, items, indexKey) {
  container.innerHTML = "";
  items.forEach((item, i) => {
    const li = document.createElement("li");
    li.dataset.index = i;
    li.textContent = (i === state.menuIndex[indexKey] ? "▸ " : "  ") + item.label;
    if (i === state.menuIndex[indexKey]) li.classList.add("sel");
    container.appendChild(li);
  });
}

function refreshMainMenu() {
  const items = [
    { label: "Play" },
    { label: "Game Mode" },
    { label: "Theme" },
    { label: "Help" },
    { label: "About" }
  ];
  buildList(document.querySelector('[data-menu="main"]'), items, "menu");
}
const MAIN_ACTIONS = ["play", "mode", "theme", "help", "about"];

function refreshModeMenu() {
  const items = MODES.map(m => ({ label: m.name }));
  buildList(el("modeList"), items, "mode");
  const sub = MODES[state.menuIndex.mode].desc;
  let hint = el("modeHint");
  if (!hint) {
    hint = document.createElement("div");
    hint.id = "modeHint";
    hint.className = "hint-text";
    el("screen-mode").appendChild(hint);
  }
  hint.textContent = sub;
}

function refreshThemeMenu() {
  const items = THEMES.map(t => ({ label: t.name }));
  buildList(el("themeList"), items, "theme");
  const sub = THEMES[state.menuIndex.theme].desc;
  let hint = el("themeHint");
  if (!hint) {
    hint = document.createElement("div");
    hint.id = "themeHint";
    hint.className = "hint-text";
    el("screen-theme").appendChild(hint);
  }
  hint.textContent = sub;
}

// ---------- Help / About content ----------

el("helpText").innerHTML = `
<div class="tp-title">HOW TO PLAY</div>
<p><b>Move</b> — 4 left / 6 right</p>
<p><b>Rotate</b> — 2 or 5</p>
<p><b>Drop</b> — 8 hard drop</p>
<p><b>Pause</b> — 0 during play</p>
<p>Clear a full row to score. More
rows at once scores more. The
board speeds up as you level up.</p>
<p class="tp-sub">MODES</p>
<p><b>Marathon</b> — endless, gets
faster over time.</p>
<p><b>Sprint 40</b> — clear 40 lines
against the clock.</p>
<p><b>Ultra 2:00</b> — best score you
can post in two minutes.</p>
`;

el("aboutText").innerHTML = `
<div class="tp-title">${GAME_NAME}</div>
<p>Version ${GAME_VERSION}</p>
<p>Developer: ${GAME_DEVELOPER}</p>
<p class="tp-sub">&nbsp;</p>
<p>Built for Cloud Phone — small
screens, keyboard-first, no
touch required.</p>
<p>Thanks for playing.</p>
`;

// ---------- Game control ----------

function startGame() {
  game.reset(state.selectedMode);
  game.setTheme(THEMES.find(t => t.id === state.selectedTheme));
  el("timerBox").style.display = state.selectedMode === "ultra" || state.selectedMode === "sprint" ? "flex" : "none";
  showScreen("game");
  lastFrame = null;
  requestAnimationFrame(loop);
}

function pauseGame() {
  game.paused = true;
  showScreen("pause");
}

function resumeGame() {
  game.paused = false;
  showScreen("game");
  lastFrame = null;
  requestAnimationFrame(loop);
}

function endToGameOver() {
  const title = state.selectedMode === "marathon" ? "GAME OVER" : "TIME!";
  let body = `<div class="tp-title">${title}</div>`;
  body += `<p>Score: ${game.score}</p>`;
  body += `<p>Lines: ${game.lines}</p>`;
  body += `<p>Level: ${game.level}</p>`;
  el("gameoverMsg").innerHTML = body;
  showScreen("gameover");
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

let lastFrame = null;
function loop(ts) {
  if (state.screen !== "game") return;
  if (lastFrame === null) lastFrame = ts;
  const delta = ts - lastFrame;
  lastFrame = ts;

  if (!game.paused) game.tick(delta);

  el("scoreVal").textContent = game.score;
  el("levelVal").textContent = game.level;
  el("linesVal").textContent = game.lines;
  if (state.selectedMode === "sprint") {
    el("timeVal").textContent = formatTime(game.elapsedMs);
  } else if (state.selectedMode === "ultra") {
    el("timeVal").textContent = formatTime(Math.max(0, 120000 - game.elapsedMs));
  }

  game.draw();

  if (game.gameOver || game.finished) {
    endToGameOver();
    return;
  }
  requestAnimationFrame(loop);
}

// ---------- Input handling ----------

function navigateList(indexKey, items, delta) {
  const n = items.length;
  state.menuIndex[indexKey] = (state.menuIndex[indexKey] + delta + n) % n;
  if (indexKey === "menu") refreshMainMenu();
  if (indexKey === "mode") refreshModeMenu();
  if (indexKey === "theme") refreshThemeMenu();
}

function handleSelect() {
  switch (state.screen) {
    case "menu": {
      const action = MAIN_ACTIONS[state.menuIndex.menu];
      if (action === "play") startGame();
      else if (action === "mode") { refreshModeMenu(); showScreen("mode"); }
      else if (action === "theme") { refreshThemeMenu(); showScreen("theme"); }
      else if (action === "help") showScreen("help");
      else if (action === "about") showScreen("about");
      break;
    }
    case "mode":
      state.selectedMode = MODES[state.menuIndex.mode].id;
      showScreen("menu");
      break;
    case "theme":
      state.selectedTheme = THEMES[state.menuIndex.theme].id;
      showScreen("menu");
      break;
    case "gameover":
      startGame();
      break;
    default:
      break;
  }
}

function handleBack() {
  switch (state.screen) {
    case "menu":
      // RSK Exit — nothing to exit to in a browser tab; no-op / could close.
      break;
    case "mode":
    case "theme":
    case "help":
    case "about":
      showScreen("menu");
      break;
    case "game":
      pauseGame();
      break;
    case "pause":
      showScreen("menu");
      break;
    case "gameover":
      showScreen("menu");
      break;
  }
}

document.addEventListener("keydown", (e) => {
  const key = e.key;

  // Global softkeys
  if (key === "Enter") { handleSelect(); return; }
  if (key === "Escape" || key === "Backspace") { handleBack(); return; }

  if (state.screen === "menu") {
    if (key === "ArrowUp" || key === "2") navigateList("menu", MAIN_ACTIONS, -1);
    if (key === "ArrowDown" || key === "8") navigateList("menu", MAIN_ACTIONS, 1);
    return;
  }
  if (state.screen === "mode") {
    if (key === "ArrowUp" || key === "2") navigateList("mode", MODES, -1);
    if (key === "ArrowDown" || key === "8") navigateList("mode", MODES, 1);
    return;
  }
  if (state.screen === "theme") {
    if (key === "ArrowUp" || key === "2") navigateList("theme", THEMES, -1);
    if (key === "ArrowDown" || key === "8") navigateList("theme", THEMES, 1);
    return;
  }
  if (state.screen === "help" || state.screen === "about") {
    const container = el(state.screen === "help" ? "helpText" : "aboutText");
    if (key === "ArrowDown" || key === "8") container.scrollTop += 20;
    if (key === "ArrowUp" || key === "2") container.scrollTop -= 20;
    return;
  }
  if (state.screen === "game") {
    if (key === "4" || key === "ArrowLeft") game.moveLeft();
    else if (key === "6" || key === "ArrowRight") game.moveRight();
    else if (key === "2" || key === "5" || key === "ArrowUp") game.rotate();
    else if (key === "8" || key === " " || key === "ArrowDown") game.hardDrop();
    else if (key === "0") pauseGame();
    return;
  }
  if (state.screen === "pause") {
    if (key === "0") resumeGame();
    return;
  }
});

// ---------- Init ----------

applyTheme(state.selectedTheme);
refreshMainMenu();
showScreen("menu");
