const EnemyStateEnum = {
    "RANDOM": 0,
    "FOLLOW": 1,
    "COOLDOWN": 2
}
Object.freeze(DirectionEnum)

class Enemy extends Actor {

    constructor(x, y, speed, currentGraphic, startDirection){
        super(x, y, speed, currentGraphic, startDirection);
        this.isFrightened = false;
        this.sightRange = 160;
        this.startFollowTime = null;
        this.lastFollowTime = null;
        this.isFollowing = false;
        this.maxFollowTime = 5;
        this.isFollowCooldown = false
        this.maxFollowTimeCooldown = 10;

        this.currentState = EnemyStateEnum.RANDOM;
    }

    update(map, player) {

        if (this.x % this.spriteSize == 0 && this.y % this.spriteSize == 0){

            this.updateState()

            switch(this.currentState){
                case EnemyStateEnum.FOLLOW:
                    this.followPlayer(map, player)
                    break;
                case EnemyStateEnum.COOLDOWN:
                case EnemyStateEnum.RANDOM:
                    this.moveRandomDirection()
                    break;
            }
        }

        super.update(map);
    }

    isPlayerInRange(){
        return Math.abs(this.distanceBetweenPoints(this.x, this.y, player.x, player.y)) < this.sightRange
    }

    updateState(){
        switch(this.currentState){
            case EnemyStateEnum.FOLLOW:
                this.updateFollowingState();
                break;
            case EnemyStateEnum.COOLDOWN:
                this.updateFollowCooldownState();
                break
            case EnemyStateEnum.RANDOM:
                if (this.isPlayerInRange){
                    this.currentState = EnemyStateEnum.FOLLOW;
                }
                break;
        }
    }

    updateFollowingState(){
        if (this.startFollowTime){
            var now = new Date();
            var secondsDiff = (now - this.startFollowTime) / 1000;
            if(secondsDiff > this.maxFollowTime){
                this.currentState = EnemyStateEnum.COOLDOWN;
                this.lastFollowTime = now;
            }
        }
    }

    updateFollowCooldownState(){
        if (this.lastFollowTime){
            var now = new Date();
            var secondsDiff = (now - this.lastFollowTime) / 1000;
            if(secondsDiff > this.maxFollowTimeCooldown){
                if (this.isPlayerInRange()){
                    this.currentState = EnemyStateEnum.FOLLOW;
                }else{
                    this.currentState = EnemyStateEnum.RANDOM
                }
            }
        }
    }

    distanceBetweenPoints(x1, y1, x2, y2){
        var a = x1 - x2;
        var b = y1 - y2;
        return Math.sqrt(a * a + b * b)
    }

    followPlayer(map, player){

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
            this.moveRandomDirection()
        }
    }

    moveRandomDirection(){
        var notAttemtedDirections = [0, 1, 2, 3];
        var randomDirection = this.tryRandomDirection(notAttemtedDirections);
        this.nextDirection = randomDirection;
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