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
    "RIGHT": 4
}
Object.freeze(DirectionEnum)


const TileEnum = {
    "EMPTY": 0,
    "WALL": 1,
    "PICKUP": 2
}
Object.freeze(TileEnum);

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
        this.score = 0;
        this.isPaused = false;

        this.entities = [];
        this.player = new Player(32, 32, 3);
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
        this.drawScoreBoard();

        this.entities.forEach(entity => {
            entity.draw();
        })
    }

    drawBackGround() {
        context.fillRect(0, 0, screenX, screenY)
    }

    drawScoreBoard() {
        document.getElementById("score-board").innerHTML = this.score;
    }

    handleKeyInput() {
        if (rightPressed) {
            this.player.direction = DirectionEnum.RIGHT;
        }
        else if (leftPressed) {
            this.player.direction = DirectionEnum.LEFT;
        }
        else if (downPressed) {
            this.player.direction = DirectionEnum.DOWN;
        }
        else if (upPressed) {
            this.player.direction = DirectionEnum.UP;
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
    constructor(x, y, speed) {
        this.currentGraphic = playerImage;
        this.sprintSize = spriteSize
        this.direction = DirectionEnum.RIGHT;
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
        switch (this.direction) {
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

        if(this.checkCollisions) this.checkCollisions(map);

        this.x += this.xvel;
        this.y += this.yvel;

        this.xvel = 0;
        this.yvel = 0;

        if (this.x < 0) { this.x = 0 }
        if (this.y < 0) { this.y = 0 }
        if (this.x + spriteSize > screenX) { this.x = screenX - spriteSize }
        if (this.y + spriteSize > screenY) { this.y = screenY - spriteSize }
    }
}

class Actor extends Sprite {
    checkCollisions(map){
        var x;
        var y;
        for (y = 0; y < map.levelData.length; y++) {
            for (x = 0; x < map.levelData[y].length; x++) {
                let mapTile = map.levelData[y][x];

                if (mapTile != TileEnum.EMPTY)
                    var isCollided = this.didCollideRect(this.x + this.xvel, this.y + this.yvel, this.sprintSize, this.sprintSize, x * map.tileSize, y * map.tileSize, map.tileSize, map.tileSize);

                if (isCollided && this.resolveCollision) {
                    this.resolveCollision(mapTile, map, x, y);
                }
            }
        }
    }

    collideLevel(map, x, y) {
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
    
    resolveCollision(mapTile, map, x, y){
        switch (mapTile) {
            case TileEnum.WALL:
                this.collideLevel(map, x, y);
                break;
            case TileEnum.PICKUP:
                this.collidePickup(map, x, y);
                break;
        }
    }
    
    collidePickup(map, x, y){
        console.log(game.score)
        map.levelData[y][x] = TileEnum.EMPTY;
        game.score = game.score + 10;
    }
}

class Pickup extends Sprite {
}
