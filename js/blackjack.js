// 52장 카드 덱 생성 및 셔플
let deck = [];

function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push(value + suit);
    }
  }
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function drawCard() {
  if (deck.length === 0) {
    alert("덱이 다 떨어졌습니다! 새로 셔플합니다.");
    createDeck();
    shuffleDeck();
  }
  return deck.pop();
}

// 카드 값 계산 함수 (블랙잭 규칙에 맞게)
function getCardValue(card) {
  const value = card.slice(0, -1);
  if (value === "A") return 11;
  if (["K", "Q", "J"].includes(value)) return 10;
  return parseInt(value);
}

// 점수 계산 함수 (A는 1 혹은 11로 처리)
function calculateScore(cards) {
  let score = 0;
  let aceCount = 0;
  for (const card of cards) {
    let val = getCardValue(card);
    if (val === 11) aceCount++;
    score += val;
  }
  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }
  return score;
}

// 카드 DOM 생성 (색상 클래스 포함)
function renderCard(card) {
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");

  const suit = card.slice(-1);
  if (suit === "♥" || suit === "♦") {
    cardDiv.classList.add("red");
  } else {
    cardDiv.classList.add("black");
  }

  cardDiv.textContent = card;
  return cardDiv;
}

// 핸드 및 UI 업데이트 (딜러 두번째 카드 숨기기 옵션 포함)
function updateHands(hideDealerSecondCard = true) {
  const playerCardsDiv = document.getElementById("player-cards");
  const dealerCardsDiv = document.getElementById("dealer-cards");
  const playerTotalSpan = document.getElementById("player-total");
  const dealerTotalSpan = document.getElementById("dealer-total");

  playerCardsDiv.innerHTML = "";
  playerCards.forEach((card) => {
    playerCardsDiv.appendChild(renderCard(card));
  });

  dealerCardsDiv.innerHTML = "";
  if (hideDealerSecondCard && dealerCards.length > 1) {
    // 첫 번째 카드만 공개, 두 번째 카드는 뒷면 표시
    dealerCardsDiv.appendChild(renderCard(dealerCards[0]));

    const cardBack = document.createElement("div");
    cardBack.classList.add("card", "card-back");
    cardBack.textContent = "?";
    dealerCardsDiv.appendChild(cardBack);

    // 딜러 합계는 첫 카드 값만 표시
    const visibleScore = getCardValue(dealerCards[0]);
    dealerTotalSpan.textContent = visibleScore;
  } else {
    // 딜러 카드 전부 공개
    dealerCards.forEach((card) => {
      dealerCardsDiv.appendChild(renderCard(card));
    });
    dealerTotalSpan.textContent = dealerScore;
  }

  playerTotalSpan.textContent = playerScore;
}

// 상태 메시지 업데이트 함수 (색상 인자 추가, 기본 검정)
function updateStatus(message, color = "black") {
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = message;
  statusDiv.style.color = color;
}

// 버튼 활성화/비활성화 제어
function setButtons(start, hit, doubleDown, stand) {
  document.getElementById("start-btn").disabled = !start;
  document.getElementById("hit-btn").disabled = !hit;
  document.getElementById("double-btn").disabled = !doubleDown;
  document.getElementById("stand-btn").disabled = !stand;
}

// 메시지 표시 함수
function showCreditChangeMessage(buttonId, msg) {
  const messageDiv = document.getElementById(buttonId + "-credit-change");
  if (!messageDiv) return;

  messageDiv.textContent = msg;
  messageDiv.style.opacity = "1";

  setTimeout(() => {
    messageDiv.style.opacity = "0";
    messageDiv.textContent = "";
  }, 500);
}

function endRound(result, isDoubleDown = false) {
  let message = "";
  let color = "black";

  if (result === "player_bust") {
    message = "버스트! 당신이 졌습니다.";
    color = "red";
  } else if (result === "dealer_bust") {
    const creditWon = isDoubleDown ? DOUBLE_WIN_CREDIT : WIN_CREDIT;
    message = "딜러가 버스트! 당신이 이겼습니다! + " + creditWon + " 크레딧";
    color = "green";
    credits += creditWon;
  } else if (result === "player_win") {
    const creditWon = isDoubleDown ? DOUBLE_WIN_CREDIT : WIN_CREDIT;
    message = "당신이 이겼습니다! + " + creditWon + " 크레딧";
    color = "green";
    credits += creditWon;
  } else if (result === "dealer_win") {
    message = "딜러가 이겼습니다.";
    color = "red";
  } else if (result === "tie") {
    const creditReturn = isDoubleDown ? BET_CREDIT * 2 : TIE_CREDIT;
    message = "무승부입니다. + " + creditReturn + " 크레딧 (반환)";
    color = "green";
    credits += creditReturn;
  }

  updateStatus(message, color);
  updateCredits();
  setButtons(true, false, false, false);
  gameInProgress = false;
}

// 크레딧 업데이트 UI
function updateCredits() {
  document.getElementById("credits").textContent = credits;
  document.getElementById("bet-credit").textContent = BET_CREDIT;
  document.getElementById("win-credit").textContent = WIN_CREDIT;
  document.getElementById("tie-credit").textContent = TIE_CREDIT;
  document.getElementById("double-win-credit").textContent = DOUBLE_WIN_CREDIT;
}

// 딜러 턴 자동 처리
function dealerTurn(isDoubleDown = false) {
  while (dealerScore < 17) {
    dealerCards.push(drawCard());
    dealerScore = calculateScore(dealerCards);
    updateHands(false);
  }

  if (dealerScore > 21) {
    endRound("dealer_bust", isDoubleDown);
  } else if (dealerScore > playerScore) {
    endRound("dealer_win", isDoubleDown);
  } else if (dealerScore < playerScore) {
    endRound("player_win", isDoubleDown);
  } else {
    endRound("tie", isDoubleDown);
  }
}

function playerHit() {
  playerCards.push(drawCard());
  playerScore = calculateScore(playerCards);
  updateHands();

  if (playerScore > 21) {
    endRound("player_bust");
  }
}

function playerStand(isDoubleDown = false) {
  // 딜러 숨겨진 카드 공개하며 화면 업데이트
  updateHands(false);

  // 딜러 점수 다시 계산 (안전하게)
  dealerScore = calculateScore(dealerCards);

  // 딜러 턴 진행
  dealerTurn(isDoubleDown);
}

// 더블 다운 함수 수정 예시 (일부 발췌)
function playerDoubleDown() {
  if (credits < BET_CREDIT) {
    alert("크레딧이 부족합니다.");
    return;
  }

  credits -= BET_CREDIT;
  updateCredits();

  showCreditChangeMessage("double", `-${BET_CREDIT}`);

  playerCards.push(drawCard());
  playerScore = calculateScore(playerCards);
  updateHands();

  if (playerScore > 21) {
    endRound("player_bust", true);
  } else {
    // 더블다운 후 바로 스탠드 처리
    playerStand(true);
  }
}

// 게임 시작 함수
// 게임 시작 함수 수정 예시 (일부 발췌)
function startGame() {
  if (credits < BET_CREDIT) {
    alert("크레딧이 부족합니다.");
    return;
  }

  credits -= BET_CREDIT;
  updateCredits();

  showCreditChangeMessage("start", `-${BET_CREDIT}`);

  gameInProgress = true;
  updateStatus("게임 진행 중...");

  createDeck();
  shuffleDeck();

  playerCards = [drawCard(), drawCard()];
  dealerCards = [drawCard(), drawCard()];

  playerScore = calculateScore(playerCards);
  dealerScore = calculateScore(dealerCards);

  updateHands();

  // 버튼 상태: 시작 불가, 히트 가능, 더블 다운 가능, 스탠드 가능
  setButtons(false, true, true, true);
}

// 변수 초기값 및 이벤트 리스너 세팅
const BET_CREDIT = 5;
const WIN_CREDIT = BET_CREDIT * 2;
const TIE_CREDIT = BET_CREDIT;
const DOUBLE_WIN_CREDIT = BET_CREDIT * 4; // 더블다운 승리 시 4배 지급

let credits = 30;
let gameInProgress = false;

let playerCards = [];
let dealerCards = [];
let playerScore = 0;
let dealerScore = 0;

// 버튼 이벤트 연결
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("hit-btn").addEventListener("click", () => {
  if (gameInProgress) playerHit();
});
document.getElementById("double-btn").addEventListener("click", () => {
  if (gameInProgress) playerDoubleDown();
});
document.getElementById("stand-btn").addEventListener("click", () => {
  if (gameInProgress) playerStand();
});

// 초기 화면 세팅
updateCredits();
setButtons(true, false, false, false);
updateStatus("게임을 시작하려면 [시작] 버튼을 누르세요.");
