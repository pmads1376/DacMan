const screenX = 768;
const screenY = 512;
const spriteSize = 32;
const tileWidth = screenX / spriteSize;
const tileHeight = screenY / spriteSize;

let canvas;
let context;
let game;
let playerResetCountdown;
let currentLevel = 1;
let itemCollection = [];
let scores = [];

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
    createNewGame();
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
    switch (game.currentState) {
        case GameStateEnum.LOAD_LEVEL:
            startGame();
            break;
        case GameStateEnum.LEVEL_COMPLETE:
            let nextLevel = currentLevel + 1;

            if (levels[nextLevel]) {
                currentLevel = nextLevel;
                game.loadLevel(currentLevel);
                startGame();
                game.currentState = GameStateEnum.STARTING;
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

function createNewGame() {
    currentLevel = 1;
    itemCollection = [];
    document.getElementById("item-collection").innerHTML = "";
    
    if(game) scores.push(game.score);

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
    if (game.currentState == GameStateEnum.PLAYING) {
        toggleGamePause();
    }

    var sections = document.getElementsByTagName("section");
    for (const section of sections) {
        section.style.display = "none";
    };

    var scoresHtml = "No Scores";
    if (scores.length != 0) {
        var scoresHtml = scores.sort((a,b) => b-a).map(score => "<li>" + score + "</li>").reduce((acc, li) => acc + li);
    }
    document.getElementById("score-list").innerHTML = scoresHtml;
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
        putTextOnOverlay("Level " + currentLevel + '<br><br> <span style="font-size: 32px;">Press Any Key To Play!</span>');
    },
    STARTING: function (game) {
    },
    PLAYING: function (game) {
        putTextOnOverlay();
        game.update();
        game.draw();
    },
    PLAYER_DEATH: function (game) {
        game.draw();
        var sec = 3;
        
        if (!playerResetCountdown){
            putTextOnOverlay("DEAD<br>" + sec, "96px")
            playerResetCountdown = window.setInterval(function () {
                putTextOnOverlay("DEAD<br>" + sec, "96px")
                sec--;
                if (sec < 0) {
                    clearInterval(playerResetCountdown);
                    playerResetCountdown = undefined;
                    putTextOnOverlay()
                    game.resetPlayer();
                    game.currentState = GameStateEnum.PLAYING;
                    return;
                }
            }, 1000);
        }
    },
    PAUSED: function (game) {
        game.draw();
        putTextOnOverlay("Paused");
    },
    LEVEL_COMPLETE: function (game) {
        putTextOnOverlay("Level " + game.levelNumber + " Complete!<br><br> Press Any Key To Play!")
    },
    GAME_OVER: function (game) {
        putTextOnOverlay("Game Over");
    },
    GAME_COMPLETE: function (game) {
        putTextOnOverlay("Game Completed!<br>Score " + game.score + "!");
    }
}

function putTextOnOverlay(text, fontSize) {
    document.getElementById("canvas-overlay").innerHTML = text || "";
    document.getElementById("canvas-overlay").style.fontSize = fontSize || "64px";
}