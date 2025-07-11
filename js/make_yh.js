document.addEventListener("DOMContentLoaded", () => {
    const createButton = document.getElementById("createButton");
    const resetButton = document.getElementById("resetButton");
    const box = document.getElementById("box");

     createButton.addEventListener("click", () => {
        console.log("생성 버튼 클릭됨");
        createYh();
    });
    resetButton.addEventListener("click", resetYh);

    function createYh() {
        const boxRect = box.getBoundingClientRect();

        const yh = document.createElement("img");
        yh.classList.add("yh");
        yh.src = "/static/images/yh.png"; // 경로 수정
        yh.alt = "영근이형";

        const x = Math.random() * (boxRect.width - 32);
        const y = Math.random() * (boxRect.height - 32);

        yh.style.left = `${x}px`;
        yh.style.top = `${y}px`; // 직접 지정
        yh.style.setProperty("--end-position", `${y}px`);

        box.appendChild(yh);

        console.log(`생성된 위치: x=${x}, y=${y}`);
    }


    function resetYh() {
        box.innerHTML = "";
    }
});
