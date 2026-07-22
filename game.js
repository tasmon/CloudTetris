// Cloud Tetris — Game Engine

const COLS = 10;
const ROWS = 20;

class Game {
  constructor(boardCanvas, nextCanvas) {
    this.boardCanvas = boardCanvas;
    this.boardCtx = boardCanvas.getContext("2d");
    this.nextCanvas = nextCanvas;
    this.nextCtx = nextCanvas.getContext("2d");
    this.cell = boardCanvas.width / COLS; // 12px
    this.theme = THEMES[0];
    this.reset("marathon");
  }

  reset(mode) {
    this.mode = mode || "marathon";
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.bag = makeBag();
    this.bagIndex = 0;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.gameOver = false;
    this.paused = false;
    this.dropAccum = 0;
    this.elapsedMs = 0;
    this.finished = false; // sprint/ultra completion flag
    this._spawnNext();
    this._spawnPiece();
  }

  setTheme(theme) {
    this.theme = theme;
  }

  _nextFromBag() {
    if (this.bagIndex >= this.bag.length) {
      this.bag = makeBag();
      this.bagIndex = 0;
    }
    return this.bag[this.bagIndex++];
  }

  _spawnNext() {
    this.nextType = this._nextFromBag();
  }

  _spawnPiece() {
    const type = this.nextType;
    this._spawnNext();
    this.cur = {
      type,
      matrix: cloneMatrix(SHAPES[type]),
      x: 3,
      y: -1
    };
    if (this._collides(this.cur.matrix, this.cur.x, this.cur.y)) {
      this.gameOver = true;
    }
  }

  _collides(matrix, ox, oy) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!matrix[r][c]) continue;
        const x = ox + c;
        const y = oy + r;
        if (x < 0 || x >= COLS || y >= ROWS) return true;
        if (y >= 0 && this.grid[y][x]) return true;
      }
    }
    return false;
  }

  moveLeft() {
    if (this.gameOver || this.paused) return;
    if (!this._collides(this.cur.matrix, this.cur.x - 1, this.cur.y)) this.cur.x--;
  }

  moveRight() {
    if (this.gameOver || this.paused) return;
    if (!this._collides(this.cur.matrix, this.cur.x + 1, this.cur.y)) this.cur.x++;
  }

  rotate() {
    if (this.gameOver || this.paused) return;
    if (this.cur.type === "O") return;
    const rotated = rotateMatrix(this.cur.matrix);
    // simple kick attempts: same spot, then left, then right
    const kicks = [0, -1, 1, -2, 2];
    for (const dx of kicks) {
      if (!this._collides(rotated, this.cur.x + dx, this.cur.y)) {
        this.cur.matrix = rotated;
        this.cur.x += dx;
        return;
      }
    }
  }

  softDropStep() {
    if (this.gameOver || this.paused) return false;
    if (!this._collides(this.cur.matrix, this.cur.x, this.cur.y + 1)) {
      this.cur.y++;
      return true;
    } else {
      this._lockPiece();
      return false;
    }
  }

  hardDrop() {
    if (this.gameOver || this.paused) return;
    let dist = 0;
    while (!this._collides(this.cur.matrix, this.cur.x, this.cur.y + 1)) {
      this.cur.y++;
      dist++;
    }
    this.score += dist * 2;
    this._lockPiece();
  }

  _lockPiece() {
    const { matrix, x: ox, y: oy, type } = this.cur;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!matrix[r][c]) continue;
        const x = ox + c;
        const y = oy + r;
        if (y < 0) { this.gameOver = true; continue; }
        this.grid[y][x] = type;
      }
    }
    if (this.gameOver) return;
    const cleared = this._clearLines();
    this._applyScore(cleared);
    this._spawnPiece();
  }

  _clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (this.grid[y].every(cell => cell)) {
        this.grid.splice(y, 1);
        this.grid.unshift(Array(COLS).fill(null));
        cleared++;
        y++; // re-check same index after shift
      }
    }
    return cleared;
  }

  _applyScore(cleared) {
    if (cleared <= 0) return;
    const table = [0, 100, 300, 500, 800];
    this.score += (table[cleared] || 800) * this.level;
    this.lines += cleared;
    this.level = 1 + Math.floor(this.lines / 10);

    if (this.mode === "sprint" && this.lines >= 40) {
      this.finished = true;
    }
  }

  dropIntervalMs() {
    return Math.max(90, 800 - (this.level - 1) * 65);
  }

  // Advances game time; called every animation frame with delta ms.
  tick(deltaMs) {
    if (this.gameOver || this.paused || this.finished) return;
    this.elapsedMs += deltaMs;
    this.dropAccum += deltaMs;
    const interval = this.dropIntervalMs();
    while (this.dropAccum >= interval) {
      this.dropAccum -= interval;
      this.softDropStep();
      if (this.gameOver) break;
    }
    if (this.mode === "ultra" && this.elapsedMs >= 120000) {
      this.finished = true;
    }
  }

  ghostY() {
    let y = this.cur.y;
    while (!this._collides(this.cur.matrix, this.cur.x, y + 1)) y++;
    return y;
  }

  draw() {
    const ctx = this.boardCtx;
    const cell = this.cell;
    const theme = this.theme;
    ctx.fillStyle = theme.vars["--board-bg"];
    ctx.fillRect(0, 0, this.boardCanvas.width, this.boardCanvas.height);

    // grid lines
    ctx.strokeStyle = theme.vars["--grid"];
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cell + 0.5, 0);
      ctx.lineTo(x * cell + 0.5, ROWS * cell);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cell + 0.5);
      ctx.lineTo(COLS * cell, y * cell + 0.5);
      ctx.stroke();
    }

    // settled blocks
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const t = this.grid[y][x];
        if (t) this._drawCell(ctx, x, y, theme.pieces[t]);
      }
    }

    if (!this.gameOver && this.cur) {
      // ghost piece
      const gy = this.ghostY();
      this._forEachCell(this.cur.matrix, (r, c) => {
        this._drawCell(ctx, this.cur.x + c, gy + r, null, theme.ghost);
      });
      // active piece
      this._forEachCell(this.cur.matrix, (r, c) => {
        this._drawCell(ctx, this.cur.x + c, this.cur.y + r, theme.pieces[this.cur.type]);
      });
    }

    this._drawNext();
  }

  _forEachCell(matrix, fn) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (matrix[r][c]) fn(r, c);
      }
    }
  }

  _drawCell(ctx, x, y, color, overrideColor) {
    if (y < 0) return;
    const cell = this.cell;
    ctx.fillStyle = overrideColor || color;
    ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
  }

  _drawNext() {
    const ctx = this.nextCtx;
    const theme = this.theme;
    ctx.fillStyle = theme.vars["--panel-bg"];
    ctx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    const matrix = SHAPES[this.nextType];
    // find bounding box for centering
    let minX = 4, maxX = -1, minY = 4, maxY = -1;
    this._forEachCell(matrix, (r, c) => {
      minX = Math.min(minX, c); maxX = Math.max(maxX, c);
      minY = Math.min(minY, r); maxY = Math.max(maxY, r);
    });
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const cell = Math.floor(Math.min(this.nextCanvas.width / 4, this.nextCanvas.height / 4));
    const offX = (this.nextCanvas.width - w * cell) / 2;
    const offY = (this.nextCanvas.height - h * cell) / 2;
    ctx.fillStyle = theme.pieces[this.nextType];
    this._forEachCell(matrix, (r, c) => {
      ctx.fillRect(offX + (c - minX) * cell + 1, offY + (r - minY) * cell + 1, cell - 2, cell - 2);
    });
  }
}
