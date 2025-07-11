document.getElementById("rollButton").addEventListener("click", rollGame);

function rollGame() {
    const pick = document.querySelector('input[name="pick"]:checked').value; // odd/even

    // 두 주사위 숫자 생성
    const n1 = rollDice("dice1");
    const n2 = rollDice("dice2");

    // 애니메이션 끝난 뒤 결과 계산
    setTimeout(() => {
        const sum = n1 + n2;
        const parity = sum % 2 === 0 ? "even" : "odd";
        const userStr = pick === "odd" ? "홀" : "짝";
        const parStr = parity === "odd" ? "홀" : "짝";
        const result = pick === parity ? "🎉 WIN!" : "😢 LOSE";

        document.getElementById("output").textContent = `주사위: ${n1} + ${n2} = ${sum} (${parStr}) → ${result}`;
    }, 500);
}

function rollDice(id) {
    const dice = document.getElementById(id);
    const dots = dice.querySelectorAll(".dot");
    dots.forEach((dot) => (dot.style.display = "none"));

    const num = Math.floor(Math.random() * 6) + 1;
    dice.classList.add("rolling");

    setTimeout(() => {
        dice.classList.remove("rolling");
        showDots(dice, num);
    }, 500);

    return num;
}

function showDots(dice, number) {
    const q = (cls) => (dice.querySelector(cls).style.display = "block");
    switch (number) {
        case 1:
            q(".one");
            break;
        case 2:
            q(".two");
            q(".five");
            break;
        case 3:
            q(".one");
            q(".two");
            q(".five");
            break;
        case 4:
            q(".two");
            q(".three");
            q(".four");
            q(".five");
            break;
        case 5:
            q(".one");
            q(".two");
            q(".three");
            q(".four");
            q(".five");
            break;
        case 6:
            q(".two");
            q(".three");
            q(".four");
            q(".five");
            q(".six");
            q(".seven");
            break;
    }
}
