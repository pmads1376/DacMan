const screenX = 750;
const screenY = 500;
const sprintSize = 32;

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

var playerImage = new Image();
playerImage.src = "images/player.png"


window.onload = init;

function init(){
    canvas = document.getElementById('dudePacMan');
    context = canvas.getContext('2d');
    game = new Game();

    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);

    // Start the first frame request
    window.requestAnimationFrame(mainLoop);
}

function mainLoop() {
    game.update();
    game.draw();

    window.requestAnimationFrame(mainLoop);
}

function keyDownHandler(event) {
    if(event.keyCode == 39) {
        rightPressed = true;
    }
    else if(event.keyCode == 37) {
        leftPressed = true;
    }
    if(event.keyCode == 40) {
    	downPressed = true;
    }
    else if(event.keyCode == 38) {
    	upPressed = true;
    }
}

function keyUpHandler(event) {
    if(event.keyCode == 39) {
        rightPressed = false;
    }
    else if(event.keyCode == 37) {
        leftPressed = false;
    }
    if(event.keyCode == 40) {
    	downPressed = false;
    }
    else if(event.keyCode == 38) {
    	upPressed = false;
    }
}


class Game {

    constructor(){
        this.entities = [];
        this.player = new Player(100,100, 3);

        this.entities.push(this.player);
    }

    update() {
        this.handleKeyInput();
        this.entities.forEach(entity => {
            entity.update();
        })
    }
    
    draw() {
        this.drawBackGround()
    
        this.entities.forEach(entity => {
            entity.draw();
        })
    }
    
    drawBackGround() {
        context.fillRect(0, 0, screenX, screenY)
    }

    handleKeyInput() {
        if(rightPressed) {
            this.player.direction = DirectionEnum.RIGHT;
        }
        else if(leftPressed) {
            this.player.direction = DirectionEnum.LEFT;
        }
        else if(downPressed) {
            this.player.direction = DirectionEnum.DOWN;
        }
        else if(upPressed) {
            this.player.direction = DirectionEnum.UP;
        }
    }
}

class Sprite {
    constructor(x, y, speed){
        this.currentGraphic = playerImage;
        this.direction = DirectionEnum.RIGHT;
        this.alive = true;
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

    draw() {
        console.log("Draw Entity");
        context.drawImage(this.currentGraphic, this.x, this.y);
    }

    update() {
        switch(this.direction) {
            case DirectionEnum.UP:
                this.y = this.y -= this.speed;
                break;
            case DirectionEnum.DOWN:
                this.y = this.y += this.speed;
                break;
            case DirectionEnum.LEFT:
                this.x = this.x -= this.speed;
                break;
            case DirectionEnum.RIGHT:
                this.x = this.x += this.speed;
                break;
        }

        if (this.x < 0) {this.x = 0}
        if (this.y < 0) {this.y = 0}
        if (this.x + sprintSize > screenX) {this.x = screenX - sprintSize}
        if (this.y + sprintSize > screenY) {this.y = screenY - sprintSize}
    }
}

class Player extends Sprite {
}

