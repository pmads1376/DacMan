const screenX = 768;
const screenY = 512;
const spriteSize = 32;
const tileWidth = screenX / spriteSize;
const tileHeight = screenY / spriteSize;

let canvas;
let context;
let game;

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

const DirectionEnum = {
    "UP": 1,
    "DOWN": 2,
    "LEFT": 3,
    "RIGHT": 4,
    "STOPPED": 5
}
Object.freeze(DirectionEnum)

var playerImage = new Image();
playerImage.src = "images/player.png";

var tileSheet = new Image();
tileSheet.src = "images/tilesheet.png"

window.onload = init;

function init() {
    canvas = document.getElementById('dudePacMan');
    context = canvas.getContext('2d');

    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);

    // Start the first frame request
    startNewGame();
    window.requestAnimationFrame(mainLoop);
}

function mainLoop() {
    if (!game.isPaused) {
        game.update();
        game.draw();
    }

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

function startNewGame() {
    game = new Game();
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
    game.isPaused = !game.isPaused;

    var playPauseBtn = document.getElementById("play-pause-toggle");
    playPauseBtn.classList.toggle("pause");
    playPauseBtn.classList.toggle("play");
}

class Game {
    constructor() {
        this.entities = [];
        this.player = new Player(32, 32, 4);
        this.map = new Map(tileSheet, level_one);

        this.entities.push(this.player);
    }

    update() {
        this.handleKeyInput();
        this.entities.forEach(entity => {
            entity.update(this.map);
        })
    }

    draw() {
        this.drawBackGround()
        this.map.draw();

        this.entities.forEach(entity => {
            entity.draw();
        })
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

class Pickup {
    constructor() {
        this.x = x;
        this.y = y;
        this.value = 10;
    }
}

class PowerUp extends Pickup {

}

class Special extends Pickup {
    
}

class Sprite {
    constructor(x, y, speed) {
        this.currentGraphic = playerImage;
        this.sprintSize = spriteSize
        this.currentDirection = DirectionEnum.DOWN;
        this.nextDirection = this.currentDirection;
        this.alive = true;
        this.x = x;
        this.y = y;
        this.xvel = 0;
        this.yvel = 0
        this.speed = speed;
    }

    draw() {
        context.drawImage(this.currentGraphic, this.x, this.y);
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

class Player extends Sprite {
}
