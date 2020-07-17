class Game {
    constructor(levelNumber) {
        this.currentState = GameStateEnum.LOAD_LEVEL;

        this.score = 0;        
        this.loadLevel(levelNumber);
    }

    loadLevel(levelNumber) {
        this.entities = [];
        this.enemies = [];
        this.pickups = [];

        this.levelNumber = levelNumber;
        this.level = levels[levelNumber];

        this.player = new Player(this.level.startingCoords.x * spriteSize, this.level.startingCoords.y * spriteSize, 2, playerImage, DirectionEnum.DOWN);
        this.map = new Map(tileSheet, this.level.map);

        this.level.ghosts.forEach((ghostInfo) =>{
            var image = new Image();
            image.src = ghostInfo.img;
            var ghost = new Enemy(ghostInfo.x * spriteSize, ghostInfo.y * spriteSize, 2, image, Math.floor(Math.random() * 3));
            this.enemies.push(ghost);
        })
  
        this.initializePickups();
        this.pickupsRemaining = this.pickups.length;

        this.entities.push(this.player);
    }

    processState() {
        this.currentState(this);
    }

    initializePickups() {
        var x;
        var y;
        for (y = 0; y < this.map.levelData.length; y++) {
            for (x = 0; x < this.map.levelData[y].length; x++) {
                if (y == this.level.startingCoords[1] && x == this.level.startingCoords[0]) {
                    continue;
                }

                if (this.map.levelData[y][x] === 0) {
                    var pickUp = new Pickup(x * spriteSize, y * spriteSize);
                    this.pickups.push(pickUp);
                }
            }
        }

        var randomPickup = Math.floor(Math.random() * this.pickups.length);
        var oldPickUp = this.pickups[randomPickup];
        var special = new Special(oldPickUp.x, oldPickUp.y, this);

        this.pickups.splice(randomPickup, 1, special);

        this.entities = this.entities.concat(this.pickups);
    }

    update() {
        this.handleKeyInput();
        this.entities.forEach(entity => {
            entity.update(this.map);
        });

        this.enemies.forEach(enemy => {
            enemy.update(this.map, this.player);
        });

        if (!this.player.alive && this.player.lives > 0){
            this.currentState = GameStateEnum.PLAYER_DEATH;
        }else if (!this.player.alive && this.player.lives <= 0) {
            this.currentState = GameStateEnum.GAME_OVER;
        }
    }

    draw() {
        this.drawBackGround()
        this.map.draw();
        this.drawLives();

        this.entities.forEach(entity => {
            entity.draw();
        });

        this.enemies.forEach(enemy => {
            enemy.draw(this.map);
        });

        document.getElementById("score-board").innerHTML = this.score;
    }

    drawBackGround() {
        context.fillRect(0, 0, screenX, screenY)
    }

    handleKeyInput() {
        if (rightPressed) {
            this.player.nextDirection = DirectionEnum.RIGHT;
        }
        else if (leftPressed) {
            this.player.nextDirection = DirectionEnum.LEFT;
        }
        else if (downPressed) {
            this.player.nextDirection = DirectionEnum.DOWN;
        }
        else if (upPressed) {
            this.player.nextDirection = DirectionEnum.UP;
        }
    }

    resetPlayer() {
        this.player.x = this.level.startingCoords.x * spriteSize;;
        this.player.y = this.level.startingCoords.y * spriteSize;;
        this.player.alive = true;
        this.player.lives -= 1;

        this.drawLives();

        this.enemies.forEach((enemy, index) => {
            enemy.x = this.level.ghosts[index].x * spriteSize;
            enemy.y = this.level.ghosts[index].y * spriteSize;
        })
    }

    drawLives() {
        var lifeImages = [];
        for(var l = 0; l < this.player.lives; l++){
            lifeImages.push('<img src="images/player.png" class="life">');
        }

        document.getElementById("lives").innerHTML = lifeImages.length === 0 ? "" : lifeImages.reduce((a, h) => a + h);
    }
}