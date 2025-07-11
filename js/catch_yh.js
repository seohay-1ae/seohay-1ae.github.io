document.addEventListener("DOMContentLoaded", () => {
    const yh = document.getElementById("yh");
    const box = document.querySelector(".box");


    yh.addEventListener("mouseover", moveYh);
	yh.addEventListener("click", cloneYh);

    function moveYh() {
        const boxRect = box.getBoundingClientRect();
        const yhRect = yh.getBoundingClientRect();

        const maxX = boxRect.width - yhRect.width;
        const maxY = boxRect.height - yhRect.height;

        // -200px ~ +200px 범위에서 무작위 오프셋
        let offsetX = Math.random() * 400 - 200;
        let offsetY = Math.random() * 400 - 200;

        // 현재 위치 + 오프셋
        let newX = yh.offsetLeft + offsetX;
        let newY = yh.offsetTop + offsetY;

        // 경계를 벗어나면 박스 중앙으로
        if (newX < 0 || newX > maxX || newY < 0 || newY > maxY) {
            newX = maxX / 2;
            newY = maxY / 2;
        }

        yh.style.left = `${newX}px`;
        yh.style.top = `${newY}px`;
    }
	
	    function cloneYh() {
        const clone = yh.cloneNode(true); // 요소 복제
        clone.style.position = "absolute";

        // 박스 안의 임의 위치 지정
        const boxRect = box.getBoundingClientRect();
        const maxX = boxRect.width - yh.offsetWidth;
        const maxY = boxRect.height - yh.offsetHeight;

        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;

        clone.style.left = `${randomX}px`;
        clone.style.top = `${randomY}px`;

        // 이벤트 다시 연결 (복제된 것도 마우스오버 시 이동 & 또 복제 가능)
        clone.addEventListener("mouseover", moveYh);
        clone.addEventListener("click", cloneYh);

        box.appendChild(clone);
    }
	
});
