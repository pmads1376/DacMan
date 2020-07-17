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

        this.player = new Player(this.level.startingCoords[0] * spriteSize, this.level.startingCoords[0] * spriteSize, 2, playerImage, DirectionEnum.DOWN);
        this.map = new Map(tileSheet, this.level.map);
        var ghost = new Enemy(512, 384, 2, enemyImage, DirectionEnum.RIGHT);
        
        this.initializePickups();
        // var pickup =new Pickup(32, 64);
        // this.pickups.push(pickup);
        // this.entities.push(pickup)
        this.pickupsRemaining = this.pickups.length;

        this.entities.push(this.player);
        this.enemies.push(ghost);
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

        if (!this.player.alive){
            this.currentState = GameStateEnum.PLAYER_DEATH;
        }
    }

    draw() {
        this.drawBackGround()
        this.map.draw();

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
        this.player.x = 32;
        this.player.y = 32;
        this.player.alive = true;

        this.enemies.forEach((enemy) => {
            enemy.x = 512;
            enemy.y = 384;
        })
    }

}