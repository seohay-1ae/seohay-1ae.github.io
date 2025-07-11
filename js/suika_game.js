const gameArea = document.getElementById("game-area");
const nextFruitDisplay = document.getElementById("next-fruit");
const gameOutLine = document.getElementById("game-out-line");
const GAME_OVER_Y = gameOutLine.offsetTop;
let nextFruit;

// Matter.js setup
const Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies;

const engine = Engine.create();
const render = Render.create({
  element: gameArea,
  engine: engine,
  options: {
    width: 400,
    height: 600,
    wireframes: false,
    background: "transparent",
  },
});

const ground = Bodies.rectangle(200, 600, 400, 50, { isStatic: true });
const leftWall = Bodies.rectangle(0, 275, 50, 600, { isStatic: true });
const rightWall = Bodies.rectangle(400, 275, 50, 600, { isStatic: true });

World.add(engine.world, [ground, leftWall, rightWall]);

Engine.run(engine);
Render.run(render);

const fruitTypes = [
  {
    imgSrc: "../static/images/suika/chunggyo.png",
    radius: 15,
    color: "rgb(255, 0, 0)",
  },
  {
    imgSrc: "../static/images/suika/dongwook.png",
    radius: 20,
    color: "rgb(245, 122, 0)",
  },
  {
    imgSrc: "../static/images/suika/jeongmin.png",
    radius: 25,
    color: "rgb(255, 225, 0)",
  },
  {
    imgSrc: "../static/images/suika/soyun.png",
    radius: 30,
    color: "rgb(10, 194, 0)",
  },
  {
    imgSrc: "../static/images/suika/youngbum.png",
    radius: 35,
    color: "rgb(0, 223, 211)",
  },
  {
    imgSrc: "../static/images/suika/younggeon-front.png",
    radius: 40,
    color: "rgb(0, 119, 255)",
  },
  {
    imgSrc: "../static/images/suika/younggeon-side.png",
    radius: 45,
    color: "rgb(87, 68, 255)",
  },
  {
    imgSrc: "../static/images/suika/younggeon-with-teacher.png",
    radius: 50,
    color: "rgb(162, 55, 255)",
  },
  {
    imgSrc: "../static/images/suika/teacher.png",
    radius: 55,
    color: "rgb(245, 129, 255)",
  },
  {
    imgSrc: "../static/images/suika/duri.png",
    radius: 60,
    color: "rgb(0, 0, 0)",
  },
];

function getRandomFruit() {
  return fruitTypes[Math.floor(Math.random() * 5)]; // Start with smaller fruits
}

function createFruit(x, y, fruit) {
  const circle = Bodies.circle(x, y, fruit.radius, {
    restitution: 0.8,
    friction: 0.1,
    render: {
      visible: false,
    },
  });

  World.add(engine.world, circle);

  const fruitWrapper = document.createElement("div");
  fruitWrapper.className = "fruit";
  fruitWrapper.style.width = `${fruit.radius * 2}px`;
  fruitWrapper.style.height = `${fruit.radius * 2}px`;
  fruitWrapper.style.backgroundColor = fruit.color;

  const img = document.createElement("img");
  img.src = fruit.imgSrc;
  img.alt = "fruit image";
  img.style.width = "80%";
  img.style.height = "80%";
  img.style.borderRadius = "50%";
  img.style.objectFit = "cover";

  fruitWrapper.appendChild(img);
  gameArea.appendChild(fruitWrapper);

  return { body: circle, element: fruitWrapper };
}

function updateFruitPosition(fruit) {
  const { x, y } = fruit.body.position;
  const radius = fruit.body.circleRadius;
  fruit.element.style.left = `${x - radius}px`;
  fruit.element.style.top = `${y - radius}px`;
}

function displayNextFruit() {
  nextFruit = getRandomFruit();
  nextFruitDisplay.innerHTML = `
    <div style="
      width: ${nextFruit.radius * 2}px;
      height: ${nextFruit.radius * 2}px;
      background-color: ${nextFruit.color};
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    ">
      <img src="${nextFruit.imgSrc}" alt="next fruit" style="
        width: 100%;
        height: 100%;
        object-fit: cover;
      " />
    </div>
  `;
}

let currentFruit = null;
let fruits = [];
let score = 0;
const scoreDisplay = document.getElementById("score-display");

function dropFruit(x) {
  if (currentFruit) return;
  currentFruit = createFruit(x, 40, nextFruit);
  fruits.push(currentFruit);
  displayNextFruit();
}

function showMessage(text) {
  const msg = document.createElement("div");
  msg.textContent = text;

  Object.assign(msg.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    padding: "20px 25px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff",
    background: "rgba(0,0,0,0.7)",
    borderRadius: "12px",
    zIndex: 2000,
    opacity: "1",
    transition: "opacity 1s ease-out",
    pointerEvents: "none",
  });

  document.getElementById("game-container").appendChild(msg);

  setTimeout(() => (msg.style.opacity = "0"), 3000);
  setTimeout(() => msg.remove(), 5000);
}

gameArea.addEventListener("mousemove", (e) => {
  if (!currentFruit) {
    const rect = gameArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    nextFruitDisplay.style.left = `${x - nextFruit.radius}px`;
  }
});

gameArea.addEventListener("click", (e) => {
  const rect = gameArea.getBoundingClientRect();
  const x = e.clientX - rect.left;
  dropFruit(x);
});

let overCount = 0;
const OVER_LIMIT = 3;

function gameLoop() {
  fruits.forEach(updateFruitPosition);

  if (currentFruit && currentFruit.body.position.y > 0) {
    currentFruit = null;
  }

  if (
    fruits.some((f) => f.body.position.y - f.body.circleRadius < GAME_OVER_Y)
  ) {
    if (++overCount >= OVER_LIMIT) {
      alert("Game Over!");
      location.reload();
      return;
    }
  } else {
    overCount = 0;
  }

  for (let i = 0; i < fruits.length; i++) {
    for (let j = i + 1; j < fruits.length; j++) {
      const fruitA = fruits[i];
      const fruitB = fruits[j];

      if (
        Matter.Collision.collides(fruitA.body, fruitB.body) &&
        fruitA.body.circleRadius === fruitB.body.circleRadius
      ) {
        const currentLevel = fruitTypes.findIndex(
          (f) => f.radius === fruitA.body.circleRadius
        );
        const nextLevel = currentLevel + 1;

        if (nextLevel < fruitTypes.length) {
          const gainedScore = (currentLevel + 1) ** 2;
          score += gainedScore;
          scoreDisplay.textContent = `점수: ${score}`; // 여기서 점수 업데이트
          console.log("Score +", gainedScore, "Total:", score);

          const newFruit = createFruit(
            (fruitA.body.position.x + fruitB.body.position.x) / 2,
            (fruitA.body.position.y + fruitB.body.position.y) / 2,
            fruitTypes[nextLevel]
          );
          fruits.push(newFruit);
        } else {
          showMessage("역시 영근이 형이야!");
        }

        World.remove(engine.world, fruitA.body);
        World.remove(engine.world, fruitB.body);
        gameArea.removeChild(fruitA.element);
        gameArea.removeChild(fruitB.element);
        fruits = fruits.filter((f) => f !== fruitA && f !== fruitB);
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

displayNextFruit();
gameLoop();

const fullscreenBtn = document.getElementById("fullscreenBtn");
fullscreenBtn.addEventListener("click", toggleFullScreen);

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
