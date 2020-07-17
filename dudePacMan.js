const screenX = 768;
const screenY = 512;
const spriteSize = 32;
const tileWidth = screenX / spriteSize;
const tileHeight = screenY / spriteSize;

let canvas;
let context;
let game;
let currentLevel = 1;

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

const DirectionEnum = {
    "UP": 0,
    "DOWN": 1,
    "LEFT": 2,
    "RIGHT": 3,
    "STOPPED": 4
}
Object.freeze(DirectionEnum)

window.onload = init;

function init() {
    canvas = document.getElementById('dudePacMan');
    context = canvas.getContext('2d');

    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);

    // Start the first frame request
    loadNewGame();
    window.requestAnimationFrame(mainLoop);
}

function mainLoop() {
    game.processState();

    window.requestAnimationFrame(mainLoop);
}

function keyDownHandler(event) {
    if (event.keyCode == 39) {
        rightPressed = true;
    }
    else if (event.keyCode == 37) {
        leftPressed = true;
    }
    if (event.keyCode == 40) {
        downPressed = true;
    }
    else if (event.keyCode == 38) {
        upPressed = true;
    }
}

function keyUpHandler(event) {
    switch(game.currentState){
        case GameStateEnum.LOAD_LEVEL:
            startGame();
            break;
        case GameStateEnum.LEVEL_COMPLETE:
            let nextLevel = currentLevel + 1;

            if(levels[nextLevel]){
                loadNewGame();
                startGame();
            } else {
                game.currentState = GameStateEnum.GAME_COMPLETE;
            }

            break;
    }

    if (event.keyCode == 39) {
        rightPressed = false;
    }
    else if (event.keyCode == 37) {
        leftPressed = false;
    }
    if (event.keyCode == 40) {
        downPressed = false;
    }
    else if (event.keyCode == 38) {
        upPressed = false;
    }
}

function startNewGame(){
    currentLevel = 1;
    loadNewGame();
}

function loadNewGame() {
    game = new Game(currentLevel);
}

function startGame() {
    putTextOnOverlay();
    game.currentState = GameStateEnum.STARTING;
    var sec = 3;
    var countDownInterval = window.setInterval(function () {
        putTextOnOverlay(sec, "96px")
        sec--;
        if (sec < 0) {
            clearInterval(countDownInterval);
            putTextOnOverlay()
            game.currentState = GameStateEnum.PLAYING;
            return;
        }
    }, 1000)
}

function showBoard() {
    var sections = document.getElementsByTagName("section");
    for (const section of sections) {
        section.style.display = "none";
    };

    document.getElementById("game-board-section").style.display = "block";
}

function showScore() {
    if (!game.isPaused) {
        toggleGamePause();
    }

    var sections = document.getElementsByTagName("section");
    for (const section of sections) {
        section.style.display = "none";
    };

    document.getElementById("score-section").style.display = "block";
}

function toggleGamePause() {
    if (game.currentState == GameStateEnum.PAUSED) {
        game.currentState = GameStateEnum.PLAYING;
    } else if (game.currentState == GameStateEnum.PLAYING) {
        game.currentState = GameStateEnum.PAUSED;
    }

    var playPauseBtn = document.getElementById("play-pause-toggle");
    playPauseBtn.classList.toggle("pause");
    playPauseBtn.classList.toggle("play");
}

const GameStateEnum = {
    LOAD_LEVEL: function (game) {
        game.draw();
        putTextOnOverlay("Press Any Key To Continue");
    },
    STARTING: function (game) {
    },
    PLAYING: function (game) {
        game.update();
        game.draw();
    },
    PAUSED: function (game) {
        game.draw();
        putTextOnOverlay("Paused");
    },
    LEVEL_COMPLETE: function (game) {
        putTextOnOverlay("Level " + game.levelNumber + " Complete!")
    },
    GAME_OVER: function (game) {
        putTextOnOverlay("Game Over");
    },
    GAME_COMPLETE: function (game) {
        putTextOnOverlay("Game Completed!<br>Score " + game.score + "!" );
    }
}

function putTextOnOverlay(text, fontSize) {
    document.getElementById("canvas-overlay").innerHTML = text || "";
    document.getElementById("canvas-overlay").style.fontSize = fontSize || "32px";
}

class Game {
    constructor(levelNumber) {
        this.currentState = GameStateEnum.LOAD_LEVEL;

        this.score = 0;
        this.entities = [];
        this.enemies = [];
        this.levelNumber = levelNumber;
        this.level = levels[levelNumber];

        this.player = new Player(this.level.startingCoords[0] * spriteSize, this.level.startingCoords[0] * spriteSize, 2, playerImage, DirectionEnum.DOWN);
        this.map = new Map(tileSheet, this.level.map);
        var ghost = new Enemy(128, 32, 2, enemyImage, DirectionEnum.RIGHT);

        this.pickups = [];
        this.initializePickups();
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
        })
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

}
class Tile {
    constructor(tilesetX, tilesetY) {
        this.tilesetX = tilesetX;
        this.tilesetY = tilesetY;
    }
}

class Map {
    constructor(tileSheet, levelData) {
        this.tileSheet = tileSheet;
        this.levelData = levelData;
        this.width = levelData[0].length;
        this.height = levelData.length;
        this.tiles = [];
        this.tileSize = spriteSize;

        var x;
        var y;
        for (x = 0; x < this.tileSheet.width / this.tileSize; x++) {
            for (y = 0; y < this.tileSheet.height / this.tileSize; y++) {
                this.tiles.push(new Tile(x, y))
            }
        }
    }

    draw() {

        context.drawImage(this.tileSheet, 200, 300);

        var x;
        var y;
        for (y = 0; y < this.levelData.length; y++) {
            for (x = 0; x < this.levelData[y].length; x++) {
                this.drawTile(x, y, this.tiles[this.levelData[y][x]])
            }
        }
    }

    drawTile(x, y, tile) {
        context.drawImage(
            this.tileSheet,
            tile.tilesetX * this.tileSize, tile.tilesetY * this.tileSize, this.tileSize, this.tileSize, // source coords
            Math.floor(x * this.tileSize), Math.floor(y * this.tileSize), this.tileSize, this.tileSize // destination coords
        );
    }
}

class Sprite {
    constructor(x, y, currentGraphic) {
        this.currentGraphic = currentGraphic;
        this.sprintSize = spriteSize
        this.alive = true;
        this.x = x;
        this.y = y;
    }

    update(map) { }

    draw() {
        if (this.alive) {
            context.drawImage(this.currentGraphic, this.x, this.y);
        }
    }
}

class Pickup extends Sprite {
    constructor(x, y, currentGraphic) {
        super(x, y, currentGraphic || pickupImage)
    }

    getScore() {
        return 10;
    }
}

class Special extends Pickup {
    constructor(x, y, game) {
        var image = new Image();
        image.src = game.level.specialImage;

        super(x, y, image);
        this.game = game;
    }

    getScore() {
        return this.game.levelNumber * 100;
    }
}

class Actor extends Sprite {
    constructor(x, y, speed, currentGraphic, startDirection) {
        super(x, y, currentGraphic);
        this.xvel = 0;
        this.yvel = 0
        this.speed = speed;
        this.currentDirection = startDirection;
        this.nextDirection = this.currentDirection;
    }

    update(map) {

        if (this.canChangeDirection(map)) {
            this.currentDirection = this.nextDirection;
        } else {
            this.nextDirection = this.currentDirection;
        }

        switch (this.currentDirection) {
            case DirectionEnum.UP:
                this.yvel = this.yvel -= this.speed;
                break;
            case DirectionEnum.DOWN:
                this.yvel = this.yvel += this.speed;
                break;
            case DirectionEnum.LEFT:
                this.xvel = this.xvel -= this.speed;
                break;
            case DirectionEnum.RIGHT:
                this.xvel = this.xvel += this.speed;
                break;
        }

        this.collideLevel(map);

        this.x += this.xvel;
        this.y += this.yvel;

        this.xvel = 0;
        this.yvel = 0;

        if (this.x < 0) { this.x = 0 }
        if (this.y < 0) { this.y = 0 }
        if (this.x + spriteSize > screenX) { this.x = screenX - spriteSize }
        if (this.y + spriteSize > screenY) { this.y = screenY - spriteSize }
    }

    canChangeDirection(map) {
        if (this.x % map.tileSize == 0 && this.y % map.tileSize == 0) {

            var entityMapX = Math.floor(this.x / map.tileSize);
            var entityMapY = Math.floor(this.y / map.tileSize);

            switch (this.currentDirection) {
                case DirectionEnum.UP:
                    if (this.nextDirection == DirectionEnum.DOWN) {
                        return false;
                    }
                    return this.checkXAxisCanMove(map, entityMapX, entityMapY);
                case DirectionEnum.DOWN:
                    if (this.nextDirection == DirectionEnum.UP) {
                        return false;
                    }
                    return this.checkXAxisCanMove(map, entityMapX, entityMapY);
                case DirectionEnum.LEFT:
                    if (this.nextDirection == DirectionEnum.RIGHT) {
                        return false;
                    }
                    return this.checkYAxisCanMove(map, entityMapX, entityMapY);
                case DirectionEnum.RIGHT:
                    if (this.nextDirection == DirectionEnum.LEFT) {
                        return false;
                    }
                    return this.checkYAxisCanMove(map, entityMapX, entityMapY);
                case DirectionEnum.STOPPED:
                    if (this.checkXAxisCanMove(map, entityMapX, entityMapY)) {
                        return true;
                    }
                    if (this.checkYAxisCanMove(map, entityMapX, entityMapY)) {
                        return true;
                    }

                    return false;
            }
        }

        return false;
    }

    checkXAxisCanMove(map, entityMapX, entityMapY) {
        switch (this.nextDirection) {
            case DirectionEnum.LEFT:
                if (map.levelData[entityMapY][entityMapX - 1] == 0) {
                    return true;
                } else {
                    return false;
                }
            case DirectionEnum.RIGHT:
                if (map.levelData[entityMapY][entityMapX + 1] == 0) {
                    return true;
                } else {
                    return false;
                }
        }
    }

    checkYAxisCanMove(map, entityMapX, entityMapY) {
        switch (this.nextDirection) {
            case DirectionEnum.UP:
                if (map.levelData[entityMapY - 1][entityMapX] == 0) {
                    return true;
                } else {
                    return false;
                }
            case DirectionEnum.DOWN:
                if (map.levelData[entityMapY + 1][entityMapX] == 0) {
                    return true;
                } else {
                    return false;
                }
        }
    }

    collideLevel(map) {
        var x;
        var y;
        for (y = 0; y < map.levelData.length; y++) {
            for (x = 0; x < map.levelData[y].length; x++) {
                if (map.levelData[y][x] != 0 &&
                    this.didCollideRect(this.x + this.xvel, this.y + this.yvel, this.sprintSize, this.sprintSize, x * map.tileSize, y * map.tileSize, map.tileSize, map.tileSize)) {
                    this.currentDirection = DirectionEnum.STOPPED;

                    if (this.xvel > 0) {
                        this.xvel = this.x - (x * map.tileSize - spriteSize);
                    }
                    else if (this.xvel < 0) {
                        this.xvel = this.x - (x * map.tileSize + map.tileSize);
                    }
                    if (this.yvel > 0) {
                        this.yvel = (y * map.tileSize - spriteSize) - this.y;
                    }
                    else if (this.yvel < 0) {
                        this.yvel = (y * map.tileSize + map.tileSize) - this.y;
                    }
                }

            }
        }
    }

    didCollideRect(sx, sy, sw, sh, tx, ty, tw, th) {
        if (tx < sx + sw &&
            tx + tw > sx &&
            ty < sy + sh &&
            ty + th > sy) {
            return true
        }
        return false;
    }
}

class Player extends Actor {
    update(map) {
        Actor.prototype.update.call(this, map);

        this.collideWithPickup();
    }

    collideWithPickup() {
        for (var i = 0; i < game.pickups.length; i++) {
            var pickup = game.pickups[i];

            if (pickup.alive && this.x == pickup.x && this.y == pickup.y) {
                game.score = game.score + pickup.getScore();
                game.pickups[i].alive = false;
                game.pickupsRemaining--;
            }

            if (game.pickupsRemaining === 0) {
                game.currentState = GameStateEnum.LEVEL_COMPLETE;
            }
        }
    }
}

class Enemy extends Actor {

    update(map, player) {

        if (this.currentDirection == DirectionEnum.STOPPED) {
            this.nextDirection = Math.random() * 3 + 1;
        }

        var xDiff = this.x - player.x;
        var yDiff = this.y - player.y;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                if (this.currentDirection == DirectionEnum.RIGHT) {
                    if (yDiff > 0) {
                        this.nextDirection = DirectionEnum.UP;
                    } else {
                        this.nextDirection = DirectionEnum.DOWN;
                    }
                } else {
                    this.nextDirection = DirectionEnum.LEFT;
                }
            } else {
                if (this.currentDirection == DirectionEnum.LEFT) {
                    if (yDiff > 0) {
                        this.nextDirection = DirectionEnum.UP;
                    } else {
                        this.nextDirection = DirectionEnum.DOWN;
                    }
                } else {
                    this.nextDirection = DirectionEnum.RIGHT;
                }
            }
        } else {
            if (yDiff > 0) {
                if (this.currentDirection == DirectionEnum.DOWN) {
                    if (xDiff > 0) {
                        this.nextDirection = DirectionEnum.LEFT;
                    } else {
                        this.nextDirection = DirectionEnum.RIGHT;
                    }
                } else {
                    this.nextDirection = DirectionEnum.UP;
                }
            } else {
                if (this.currentDirection == DirectionEnum.UP) {
                    if (xDiff > 0) {
                        this.nextDirection = DirectionEnum.LEFT;
                    } else {
                        this.nextDirection = DirectionEnum.RIGHT;
                    }
                } else {
                    this.nextDirection = DirectionEnum.DOWN;
                }
            }
        }

        if (!this.canMoveDirection(map, this.nextDirection)) {
            var notAttemtedDirections = [0, 1, 2, 3];
            var randomDirection = this.tryRandomDirection(notAttemtedDirections);
            this.nextDirection = randomDirection;
        }

        super.update(map);
    }

    tryRandomDirection(notAttemtedDirections) {

        var randomIndex = Math.floor(Math.random() * notAttemtedDirections.length);
        var randomDirection = notAttemtedDirections[randomIndex];
        if (this.canMoveDirection) {
            return randomDirection
        } else {
            notAttemtedDirections.pop(randomIndex);
            return this.tryRandomDirection(notAttemtedDirections)
        }

    }

    canMoveDirection(map, direction) {

        var entityMapX = Math.floor(this.x / map.tileSize);
        var entityMapY = Math.floor(this.y / map.tileSize);

        switch (direction) {
            case DirectionEnum.LEFT:
                if (map.levelData[entityMapY][entityMapX - 1] == 0) {
                    return true;
                } else {
                    return false;
                }
            case DirectionEnum.RIGHT:
                if (map.levelData[entityMapY][entityMapX + 1] == 0) {
                    return true;
                } else {
                    return false;
                }
            case DirectionEnum.UP:
                if (map.levelData[entityMapY - 1][entityMapX] == 0) {
                    return true;
                } else {
                    return false;
                }
            case DirectionEnum.DOWN:
                if (map.levelData[entityMapY + 1][entityMapX] == 0) {
                    return true;
                } else {
                    return false;
                }
        }
    }
}
