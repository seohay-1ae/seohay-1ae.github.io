$(document).ready(function () {
  game.initiate();

  $("#start").on("click", function () {
    game.start();
  });

  $("#reset").on("click", function () {
    game.reset();
  });
});

var game = {
  wins: 0,
  credit: 30,
  isPlaying: false, // ⬅️ 게임 진행 여부 상태 변수

  initiate: function () {
    this.updateCreditUI();
    cards.generateCards();
  },

  start: function () {
    if (this.credit < 5) {
      alert("크레딧이 부족합니다!");
      return;
    }

    this.isPlaying = true; // ⬅️ 게임 시작
    this.credit -= 5;
    this.updateCreditUI();
    board.display("");
    $("#ball").fadeOut(200);

    let times = 0;
    let timerId = setInterval(() => {
      cards.shuffle();
      times += 1;
      if (times === cards.numsOfShuffle) {
        clearInterval(timerId);
        // ⬅️ 카드 선택 가능 상태
      }
    }, 200);
  },

  reset: function () {
    this.isPlaying = false; // ⬅️ 상태 초기화
    $("#board > div:nth-child(1)").removeClass().addClass("left");
    $("#board > div:nth-child(2)").removeClass().addClass("middle");
    $("#board > div:nth-child(3)").removeClass().addClass("right");
  },

  winlose: function (that) {
    if (!this.isPlaying) return; // ⬅️ 중복 클릭 방지

    this.isPlaying = false; // ⬅️ 한 번 클릭하면 끝
    const $div = $(that);

    if ($div.children().length) {
      board.display("🎉 승리했습니다! +10 크레딧");
      this.credit += 10;
    } else {
      board.display("❌ 패배했습니다. 다시 도전하세요.");
    }

    this.updateCreditUI();
    $("#ball").fadeIn(700);
  },

  updateCreditUI: function () {
    $("#credit").text(`크레딧: ${this.credit}`);
  },
};

var board = {
  display: function (msg) {
    $("#result-message").text(msg);
  },
};

var cards = {
  numOfCards: 3,
  arrCards: [],
  numsOfShuffle: 10,

  generateCards: function () {
    const classArray = ["left", "middle", "right"];

    for (let i = 0; i < this.numOfCards; i++) {
      const $cardDiv = $('<div class="' + classArray[i] + '">');
      $("#board").append($cardDiv);

      this.arrCards.push({
        $el: $cardDiv,
        currentClass: classArray[i],
        swapClass: function (newClass) {
          const currentClass = this.currentClass;
          this.$el.removeClass(currentClass);
          this.$el.attr("class", newClass);
          this.currentClass = newClass;
        },
      });

      $cardDiv.on("click", function () {
        game.winlose(this);
      });
    }

    this.arrCards[1].ball = true;
    const $ballHolder = $("#board div:nth-child(2)");
    const $ball = $('<div id="ball">');
    $ballHolder.append($ball);
  },

  shuffle: function () {
    let i = Math.floor(Math.random() * this.arrCards.length);
    let j = Math.floor(Math.random() * this.arrCards.length);

    while (i === j) {
      j = Math.floor(Math.random() * this.arrCards.length);
    }

    const tempClass = this.arrCards[i].currentClass;
    this.arrCards[i].swapClass(this.arrCards[j].currentClass);
    this.arrCards[j].swapClass(tempClass);
  },
};
