const commonImage = "../static/images/suika/younggeon-side.png";
const differentImage = "../static/images/suika/younggeon-with-teacher.png";

let stage = 1;
let timeLeft = 10;
let timerInterval;

const stageInfo = document.getElementById("stage-info");
const timerDisplay = document.getElementById("timer");
const gameContainer = document.getElementById("game-container");
const gameOverScreen = document.getElementById("game-over");
const finalStageText = document.getElementById("final-stage");

// ➕ 오버레이 요소 생성
const stageOverlay = document.createElement("div");
stageOverlay.id = "stage-overlay";
stageOverlay.style.position = "fixed";
stageOverlay.style.top = "0";
stageOverlay.style.left = "0";
stageOverlay.style.right = "0";
stageOverlay.style.bottom = "0";
stageOverlay.style.background = "black"; // 완전한 검정
stageOverlay.style.color = "white";
stageOverlay.style.display = "flex";
stageOverlay.style.justifyContent = "center";
stageOverlay.style.alignItems = "center";
stageOverlay.style.fontSize = "48px";
stageOverlay.style.zIndex = "20";
stageOverlay.style.fontWeight = "bold";
stageOverlay.style.transition = "opacity 0.3s ease";
stageOverlay.style.opacity = "0";
stageOverlay.style.pointerEvents = "none";
document.body.appendChild(stageOverlay);

function startStage() {
  gameOverScreen.classList.add("hidden"); // 게임오버 화면 숨기기
  timeLeft = 10;
  updateStageInfo();
  updateTimerDisplay();

  // ➕ 오버레이 표시
  stageOverlay.textContent = `Stage ${stage}`;
  stageOverlay.style.opacity = "1";

  setTimeout(() => {
    generateCards();
    startTimer();

    // ➖ 오버레이 감추기
    stageOverlay.style.opacity = "0";
  }, 1000); // 1초 후 시작
}

function updateStageInfo() {
  stageInfo.textContent = `Stage: ${stage}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = `Time: ${timeLeft}s`;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function generateCards() {
  gameContainer.innerHTML = "";

  const maxStage = 13;
  const cardsPerRow = 20;
  const maxCards = maxStage * cardsPerRow;

  // 13스테이지 이상이면 카드 개수 고정 260개
  const cardCount = stage >= maxStage ? maxCards : stage * cardsPerRow;

  const answerIndex = Math.floor(Math.random() * cardCount);

  for (let i = 0; i < cardCount; i++) {
    const img = document.createElement("img");
    img.className = "card";
    img.src = i === answerIndex ? differentImage : commonImage;

    img.addEventListener("click", () => {
      if (i === answerIndex) {
        stage++;
        startStage();
      } else {
        endGame();
      }
    });

    gameContainer.appendChild(img);
  }
}

function endGame() {
  clearInterval(timerInterval);
  gameContainer.innerHTML = "";
  finalStageText.textContent = `You reached Stage ${stage}`;
  gameOverScreen.classList.remove("hidden");
}

window.addEventListener("load", () => {
  startStage();
});

window.addEventListener("resize", () => {
  generateCards();
});
