const screenX = 768;
const screenY = 512;
const spriteSize = 32;
const tileWidth = screenX / spriteSize;
const tileHeight = screenY / spriteSize;

let canvas;
let context;
let game;
let pickupSprites;

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

var playerImage = new Image();
playerImage.src = "images/player.png";

var tileSheet = new Image();
tileSheet.src = "images/tilesheet.png";

var pickupSheet = new Image();
pickupSheet.src = "images/pickups.png";

var enemyImage = new Image();
enemyImage.src = "images/ghost.png"

window.onload = init;

function init() {
    pickupSprites = new ImageSet(pickupSheet);

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
        this.enemies = [];
        this.player = new Player(32,32, 2, playerImage, DirectionEnum.DOWN);
        this.map = new Map(tileSheet, level_one);
        var ghost = new Enemy(128, 32, 2, enemyImage, DirectionEnum.RIGHT);
        this.entities.push(new Pickup(64, 64))

        this.entities.push(this.player);
        this.enemies.push(ghost);

}  
    initializePickups () {
        var x;
        var y;
        for (y = 0; y < this.map.levelData.length; y++) {
            for (x = 0; x < this.map.levelData[y].length; x++) {
                if(this.map.levelData[y][x] == 0){
                    var pickup = new Pickup(x * spriteSize + (spriteSize / 2), y * spriteSize + (spriteSize / 2));
                    this.entities.push(pickup);
                }
            }
        }
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

class ImageSet {
    constructor(spriteSheet, width, height){
        this.spriteSize = spriteSize;
        this.spriteSheet = spriteSheet;
        this.images = [];

        var x;
        var y;
        for (x = 0; x < this.spriteSheet.width / this.spriteSize; x++) {
            for (y = 0; y < this.spriteSheet.height / this.spriteSize; y++) {
                this.images.push(new Tile(x, y))
            }
        }
    }

    drawImage(x, y, image) {
        context.drawImage(
            this.spriteSheet,
            image.tilesetX * this.spriteSize, image.tilesetY * this.spriteSize, this.spriteSize, this.spriteSize, // source coords
            Math.floor(x * this.spriteSize), Math.floor(y * this.spriteSize), this.spriteSize, this.spriteSize // destination coords
        );
    }
}


class Map {
    constructor(tileSheet, levelData) {
        this.levelData = levelData;
    
        this.imageSet = new ImageSet(tileSheet, levelData[0].length, levelData.length);
    }

    draw() {

        context.drawImage(this.imageSet.spriteSheet, 200, 300);

        var x;
        var y;
        for (y = 0; y < this.levelData.length; y++) {
            for (x = 0; x < this.levelData[y].length; x++) {
                this.imageSet.drawImage(x, y, this.imageSet.images[this.levelData[y][x]])
            }
        }
    }
}

class Sprite {
    constructor(x, y, speed, currentGraphic, startDirection){
        this.currentGraphic = currentGraphic;
        this.sprintSize = spriteSize
        this.currentDirection = startDirection;
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
        if (this.x % map.spriteSize == 0 && this.y % map.spriteSize == 0) {

            var entityMapX = Math.floor(this.x / map.spriteSize);
            var entityMapY = Math.floor(this.y / map.spriteSize);

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
                    this.didCollideRect(this.x + this.xvel, this.y + this.yvel, this.sprintSize, this.sprintSize, x * map.spriteSize, y * map.spriteSize, map.spriteSize, map.spriteSize)) {
                    this.currentDirection = DirectionEnum.STOPPED;

                    if (this.xvel > 0) {
                        this.xvel = this.x - (x * map.spriteSize - spriteSize);
                    }
                    else if (this.xvel < 0) {
                        this.xvel = this.x - (x * map.spriteSize + map.spriteSize);
                    }
                    if (this.yvel > 0) {
                        this.yvel = (y * map.spriteSize - spriteSize) - this.y;
                    }
                    else if (this.yvel < 0) {
                        this.yvel = (y * map.spriteSize + map.spriteSize) - this.y;
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


class Pickup extends Sprite {
    constructor(x, y){
        super(x, y);
    }

    draw(){
        pickupSprites.drawImage(this.x, this.y, pickupSprites.images[0])
    }
}

class Player extends Sprite {
}

class Enemy extends Sprite {

    update(map, player){

        if (this.currentDirection == DirectionEnum.STOPPED){
            this.nextDirection = Math.random() * 3 + 1;
        }
        
        var xDiff = this.x - player.x;
        var yDiff = this.y - player.y;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0){
                if (this.currentDirection == DirectionEnum.RIGHT){
                    if (yDiff > 0){
                        this.nextDirection = DirectionEnum.UP;
                    }else{
                        this.nextDirection = DirectionEnum.DOWN;
                    }
                }else{
                    this.nextDirection = DirectionEnum.LEFT;
                }
            }else{
                if (this.currentDirection == DirectionEnum.LEFT){
                    if (yDiff > 0){
                        this.nextDirection = DirectionEnum.UP;
                    }else{
                        this.nextDirection = DirectionEnum.DOWN;
                    }
                }else{
                    this.nextDirection = DirectionEnum.RIGHT;
                }
            }
        }else{
            if (yDiff > 0){
                if (this.currentDirection == DirectionEnum.DOWN){
                    if (xDiff > 0){
                        this.nextDirection = DirectionEnum.LEFT;
                    }else{
                        this.nextDirection = DirectionEnum.RIGHT;
                    }
                }else{
                    this.nextDirection = DirectionEnum.UP;
                }
            }else{
                if (this.currentDirection == DirectionEnum.UP){
                    if (xDiff > 0){
                        this.nextDirection = DirectionEnum.LEFT;
                    }else{
                        this.nextDirection = DirectionEnum.RIGHT;
                    }
                }else{
                    this.nextDirection = DirectionEnum.DOWN;
                }
            }
        }

        if(!this.canMoveDirection(map, this.nextDirection)){
            var notAttemtedDirections = [0,1,2,3];
            var randomDirection = this.tryRandomDirection(notAttemtedDirections);
            this.nextDirection = randomDirection;
        }

        super.update(map);
    }

    tryRandomDirection(notAttemtedDirections){

        var randomIndex = Math.floor(Math.random() * notAttemtedDirections.length);
        var randomDirection = notAttemtedDirections[randomIndex];
        if (this.canMoveDirection){
            return randomDirection
        }else{
            notAttemtedDirections.pop(randomIndex);
            return this.tryRandomDirection(notAttemtedDirections)
        }

    }

    canMoveDirection(map, direction){

        var entityMapX = Math.floor(this.x / map.tileSize);
        var entityMapY = Math.floor(this.y / map.tileSize);

        switch(direction){
            case DirectionEnum.LEFT:
                if (map.levelData[entityMapY][entityMapX-1] == 0){
                    return true;
                }else{
                    return false;
                }
            case DirectionEnum.RIGHT:
                if (map.levelData[entityMapY][entityMapX+1] == 0){
                    return true;
                }else{
                    return false;
                }
            case DirectionEnum.UP:
                if (map.levelData[entityMapY-1][entityMapX] == 0){
                    return true;
                }else{
                    return false;
                }
            case DirectionEnum.DOWN:
                if (map.levelData[entityMapY+1][entityMapX] == 0){
                    return true;
                }else{
                    return false;
                }
        }   
    }

}
