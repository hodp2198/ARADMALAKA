const board = document.getElementById("game-board");
const ctx = board.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const statusEl = document.getElementById("status");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const directionButtons = document.querySelectorAll("[data-direction]");

const tileCount = 20;
const tileSize = board.width / tileCount;
const tickMs = 130;
const storageKey = "classic-snake-best-score";

let snake;
let direction;
let nextDirection;
let food;
let score;
let bestScore = Number(localStorage.getItem(storageKey) || 0);
let gameLoopId = null;
let isRunning = false;

bestScoreEl.textContent = bestScore;

function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  food = spawnFood();
  isRunning = false;
  scoreEl.textContent = "0";
  statusEl.textContent = "לחץ על התחל או על Space כדי לשחק.";
  draw();
}

function startGame() {
  if (isRunning) {
    return;
  }

  isRunning = true;
  statusEl.textContent = "המשחק התחיל.";
  clearInterval(gameLoopId);
  gameLoopId = setInterval(step, tickMs);
}

function restartGame() {
  clearInterval(gameLoopId);
  initGame();
}

function step() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };
  const willEat = head.x === food.x && head.y === food.y;

  if (isCollision(head, willEat)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (willEat) {
    score += 10;
    scoreEl.textContent = String(score);
    food = spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function isCollision(head, willEat) {
  const hitWall =
    head.x < 0 ||
    head.y < 0 ||
    head.x >= tileCount ||
    head.y >= tileCount;

  const bodyToCheck = willEat ? snake : snake.slice(0, -1);
  const hitSelf = bodyToCheck.some((segment) => segment.x === head.x && segment.y === head.y);

  return hitWall || hitSelf;
}

function gameOver() {
  clearInterval(gameLoopId);
  isRunning = false;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(storageKey, String(bestScore));
    bestScoreEl.textContent = String(bestScore);
  }

  statusEl.textContent = "נפסלת. לחץ על התחל מחדש או Space כדי לנסות שוב.";
}

function spawnFood() {
  let nextFood;

  do {
    nextFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake?.some((segment) => segment.x === nextFood.x && segment.y === nextFood.y));

  return nextFood;
}

function draw() {
  drawBoard();
  drawFood();
  drawSnake();
}

function drawBoard() {
  ctx.fillStyle = "#f3e8c8";
  ctx.fillRect(0, 0, board.width, board.height);

  ctx.strokeStyle = "rgba(63, 58, 47, 0.12)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= tileCount; i += 1) {
    const offset = i * tileSize;
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset, board.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, offset);
    ctx.lineTo(board.width, offset);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#2c6e49" : "#4c956c";
    ctx.fillRect(
      segment.x * tileSize + 1,
      segment.y * tileSize + 1,
      tileSize - 2,
      tileSize - 2
    );
  });
}

function drawFood() {
  ctx.fillStyle = "#bc4749";
  ctx.beginPath();
  ctx.arc(
    food.x * tileSize + tileSize / 2,
    food.y * tileSize + tileSize / 2,
    tileSize / 2.8,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function handleDirectionInput(key) {
  const normalizedKey = normalizeInputKey(key);
  const moveMap = {
    ArrowUp: { x: 0, y: -1 },
    W: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    S: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    A: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    D: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };

  const proposed = moveMap[normalizedKey];
  if (!proposed) {
    return;
  }

  const reversing =
    proposed.x === -direction.x &&
    proposed.y === -direction.y;

  if (!reversing) {
    nextDirection = proposed;
  }

  if (!isRunning) {
    startGame();
  }
}

function normalizeInputKey(key) {
  const aliases = {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight"
  };

  return aliases[key] || key;
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    if (isRunning) {
      return;
    }

    if (statusEl.textContent.startsWith("נפסלת")) {
      restartGame();
    }

    startGame();
    return;
  }

  handleDirectionInput(event.key);
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
directionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleDirectionInput(button.dataset.direction);
  });
});

initGame();
