// tower_block.js (전체 JavaScript 변환 완료)

console.clear();

class Stage {
  constructor() {
    this.container = document.getElementById("game");

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor("#D0CBC7", 1);
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const d = 20;
    this.camera = new THREE.OrthographicCamera(
      -d * aspect,
      d * aspect,
      d,
      -d,
      -100,
      1000
    );
    this.camera.position.set(2, 2, 2);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.light = new THREE.DirectionalLight(0xffffff, 0.5);
    this.light.position.set(0, 499, 0);
    this.scene.add(this.light);

    this.softLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.softLight);

    window.addEventListener("resize", () => this.onResize());
    this.onResize();
  }

  setCamera(y, speed = 0.3) {
    TweenLite.to(this.camera.position, speed, {
      y: y + 4,
      ease: Power1.easeInOut,
    });
    TweenLite.to({}, speed, {
      onUpdate: () => {
        this.camera.lookAt(new THREE.Vector3(0, y, 0));
      },
      ease: Power1.easeInOut,
    });
  }

  onResize() {
    const viewSize = 30;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.left = window.innerWidth / -viewSize;
    this.camera.right = window.innerWidth / viewSize;
    this.camera.top = window.innerHeight / viewSize;
    this.camera.bottom = window.innerHeight / -viewSize;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  add(elem) {
    this.scene.add(elem);
  }

  remove(elem) {
    this.scene.remove(elem);
  }
}

const STATES = { ACTIVE: "active", STOPPED: "stopped", MISSED: "missed" };

class Block {
  constructor(block) {
    this.STATES = STATES;
    this.MOVE_AMOUNT = 12;
    this.targetBlock = block;

    this.index = (this.targetBlock ? this.targetBlock.index : 0) + 1;
    this.workingPlane = this.index % 2 ? "x" : "z";
    this.workingDimension = this.index % 2 ? "width" : "depth";

    this.dimension = {
      width: this.targetBlock ? this.targetBlock.dimension.width : 10,
      height: this.targetBlock ? this.targetBlock.dimension.height : 2,
      depth: this.targetBlock ? this.targetBlock.dimension.depth : 10,
    };

    this.position = {
      x: this.targetBlock ? this.targetBlock.position.x : 0,
      y: this.dimension.height * this.index,
      z: this.targetBlock ? this.targetBlock.position.z : 0,
    };

    this.colorOffset = this.targetBlock
      ? this.targetBlock.colorOffset
      : Math.round(Math.random() * 100);

    if (!this.targetBlock) {
      this.color = 0x333344;
    } else {
      const offset = this.index + this.colorOffset;
      const r = Math.sin(0.3 * offset) * 55 + 200;
      const g = Math.sin(0.3 * offset + 2) * 55 + 200;
      const b = Math.sin(0.3 * offset + 4) * 55 + 200;
      this.color = new THREE.Color(r / 255, g / 255, b / 255);
    }

    this.state = this.index > 1 ? this.STATES.ACTIVE : this.STATES.STOPPED;
    this.speed = -0.1 - this.index * 0.005;
    if (this.speed < -4) this.speed = -4;
    this.direction = this.speed;

    const geometry = new THREE.BoxGeometry(
      this.dimension.width,
      this.dimension.height,
      this.dimension.depth
    );
    geometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(
        this.dimension.width / 2,
        this.dimension.height / 2,
        this.dimension.depth / 2
      )
    );
    this.material = new THREE.MeshToonMaterial({ color: this.color });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);

    if (this.state === this.STATES.ACTIVE) {
      this.position[this.workingPlane] =
        Math.random() > 0.5 ? -this.MOVE_AMOUNT : this.MOVE_AMOUNT;
    }
  }

  reverseDirection() {
    this.direction = this.direction > 0 ? this.speed : Math.abs(this.speed);
  }

  place() {
    this.state = this.STATES.STOPPED;

    let overlap =
      this.targetBlock.dimension[this.workingDimension] -
      Math.abs(
        this.position[this.workingPlane] -
          this.targetBlock.position[this.workingPlane]
      );

    const blocksToReturn = {
      plane: this.workingPlane,
      direction: this.direction,
    };

    if (this.dimension[this.workingDimension] - overlap < 0.3) {
      overlap = this.dimension[this.workingDimension];
      blocksToReturn.bonus = true;
      this.position.x = this.targetBlock.position.x;
      this.position.z = this.targetBlock.position.z;
      this.dimension.width = this.targetBlock.dimension.width;
      this.dimension.depth = this.targetBlock.dimension.depth;
    }

    if (overlap > 0) {
      const choppedDimensions = Object.assign({}, this.dimension);
      choppedDimensions[this.workingDimension] -= overlap;
      this.dimension[this.workingDimension] = overlap;

      const placedGeometry = new THREE.BoxGeometry(
        this.dimension.width,
        this.dimension.height,
        this.dimension.depth
      );
      placedGeometry.applyMatrix4(
        new THREE.Matrix4().makeTranslation(
          this.dimension.width / 2,
          this.dimension.height / 2,
          this.dimension.depth / 2
        )
      );
      const placedMesh = new THREE.Mesh(placedGeometry, this.material);

      const choppedGeometry = new THREE.BoxGeometry(
        choppedDimensions.width,
        choppedDimensions.height,
        choppedDimensions.depth
      );
      choppedGeometry.applyMatrix4(
        new THREE.Matrix4().makeTranslation(
          choppedDimensions.width / 2,
          choppedDimensions.height / 2,
          choppedDimensions.depth / 2
        )
      );
      const choppedMesh = new THREE.Mesh(choppedGeometry, this.material);

      const choppedPosition = Object.assign({}, this.position);

      if (
        this.position[this.workingPlane] <
        this.targetBlock.position[this.workingPlane]
      ) {
        this.position[this.workingPlane] =
          this.targetBlock.position[this.workingPlane];
      } else {
        choppedPosition[this.workingPlane] += overlap;
      }

      placedMesh.position.set(
        this.position.x,
        this.position.y,
        this.position.z
      );
      choppedMesh.position.set(
        choppedPosition.x,
        choppedPosition.y,
        choppedPosition.z
      );

      blocksToReturn.placed = placedMesh;
      if (!blocksToReturn.bonus) blocksToReturn.chopped = choppedMesh;
    } else {
      this.state = this.STATES.MISSED;
    }

    return blocksToReturn;
  }

  tick() {
    if (this.state === this.STATES.ACTIVE) {
      const value = this.position[this.workingPlane];
      if (value > this.MOVE_AMOUNT || value < -this.MOVE_AMOUNT)
        this.reverseDirection();
      this.position[this.workingPlane] += this.direction;
      this.mesh.position[this.workingPlane] = this.position[this.workingPlane];
    }
  }
}

class Game {
  constructor() {
    this.STATES = {
      LOADING: "loading",
      PLAYING: "playing",
      READY: "ready",
      ENDED: "ended",
      RESETTING: "resetting",
    };
    this.blocks = [];
    this.state = this.STATES.LOADING;

    this.stage = new Stage();
    this.mainContainer = document.getElementById("container");
    this.scoreContainer = document.getElementById("score");
    this.startButton = document.getElementById("start-button");
    this.instructions = document.getElementById("instructions");
    this.scoreContainer.innerHTML = "0";

    this.newBlocks = new THREE.Group();
    this.placedBlocks = new THREE.Group();
    this.choppedBlocks = new THREE.Group();

    this.stage.add(this.newBlocks);
    this.stage.add(this.placedBlocks);
    this.stage.add(this.choppedBlocks);

    this.addBlock();
    this.tick();

    this.updateState(this.STATES.READY);

    document.addEventListener("keydown", (e) => {
      if (e.keyCode === 32) this.onAction();
    });

    document.addEventListener("click", () => {
      this.onAction();
    });
  }

  updateState(newState) {
    for (let key in this.STATES) {
      this.mainContainer.classList.remove(this.STATES[key]);
    }
    this.mainContainer.classList.add(newState);
    this.state = newState;
  }

  onAction() {
    switch (this.state) {
      case this.STATES.READY:
        this.startGame();
        break;
      case this.STATES.PLAYING:
        this.placeBlock();
        break;
      case this.STATES.ENDED:
        this.restartGame();
        break;
    }
  }

  startGame() {
    if (this.state !== this.STATES.PLAYING) {
      this.scoreContainer.innerHTML = "0";
      this.updateState(this.STATES.PLAYING);
      this.addBlock();
    }
  }

  restartGame() {
    this.updateState(this.STATES.RESETTING);

    const oldBlocks = this.placedBlocks.children;
    const removeSpeed = 0.2;
    const delayAmount = 0.02;
    for (let i = 0; i < oldBlocks.length; i++) {
      TweenLite.to(oldBlocks[i].scale, removeSpeed, {
        x: 0,
        y: 0,
        z: 0,
        delay: (oldBlocks.length - i) * delayAmount,
        ease: Power1.easeIn,
        onComplete: () => this.placedBlocks.remove(oldBlocks[i]),
      });
      TweenLite.to(oldBlocks[i].rotation, removeSpeed, {
        y: 0.5,
        delay: (oldBlocks.length - i) * delayAmount,
        ease: Power1.easeIn,
      });
    }
    const cameraMoveSpeed = removeSpeed * 2 + oldBlocks.length * delayAmount;
    this.stage.setCamera(2, cameraMoveSpeed);

    const countdown = { value: this.blocks.length - 1 };
    TweenLite.to(countdown, cameraMoveSpeed, {
      value: 0,
      onUpdate: () => {
        this.scoreContainer.innerHTML = String(Math.round(countdown.value));
      },
    });

    this.blocks = this.blocks.slice(0, 1);

    setTimeout(() => {
      this.startGame();
    }, cameraMoveSpeed * 1000);
  }

  placeBlock() {
    const currentBlock = this.blocks[this.blocks.length - 1];
    const newBlocks = currentBlock.place();
    this.newBlocks.remove(currentBlock.mesh);
    if (newBlocks.placed) this.placedBlocks.add(newBlocks.placed);

    if (newBlocks.chopped) {
      this.choppedBlocks.add(newBlocks.chopped);
      const positionParams = {
        y: "-=30",
        ease: Power1.easeIn,
        onComplete: () => this.choppedBlocks.remove(newBlocks.chopped),
      };
      const rotationParams = {
        delay: 0.05,
        x: newBlocks.plane === "z" ? Math.random() * 10 - 5 : 0.1,
        z: newBlocks.plane === "x" ? Math.random() * 10 - 5 : 0.1,
        y: Math.random() * 0.1,
      };
      if (
        newBlocks.chopped.position[newBlocks.plane] >
        newBlocks.placed.position[newBlocks.plane]
      ) {
        positionParams[newBlocks.plane] =
          "+=" + 40 * Math.abs(newBlocks.direction);
      } else {
        positionParams[newBlocks.plane] =
          "-=" + 40 * Math.abs(newBlocks.direction);
      }
      TweenLite.to(newBlocks.chopped.position, 1, positionParams);
      TweenLite.to(newBlocks.chopped.rotation, 1, rotationParams);
    }

    this.addBlock();
  }

  addBlock() {
    const lastBlock = this.blocks[this.blocks.length - 1];
    if (lastBlock && lastBlock.state === lastBlock.STATES.MISSED) {
      return this.endGame();
    }

    this.scoreContainer.innerHTML = String(this.blocks.length - 1);

    const newBlock = new Block(lastBlock);
    this.newBlocks.add(newBlock.mesh);
    this.blocks.push(newBlock);

    this.stage.setCamera(this.blocks.length * 2);
    if (this.blocks.length >= 5) this.instructions.classList.add("hide");
  }

  endGame() {
    this.updateState(this.STATES.ENDED);
  }

  tick() {
    this.blocks[this.blocks.length - 1].tick();
    this.stage.render();
    requestAnimationFrame(() => this.tick());
  }
}

const game = new Game();
