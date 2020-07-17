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

        if (this.currentDirection != this.nextDirection){
            if (this.canChangeDirection(map)) {
                this.currentDirection = this.nextDirection;
            } else {
                this.nextDirection = this.currentDirection;
            }
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
        switch (this.currentDirection) {
            case DirectionEnum.UP:
                if (this.nextDirection == DirectionEnum.DOWN) {
                    return true;
                }
                return this.checkXAxisCanMove(map);
            case DirectionEnum.DOWN:
                if (this.nextDirection == DirectionEnum.UP) {
                    return true;
                }
                return this.checkXAxisCanMove(map);
            case DirectionEnum.LEFT:
                if (this.nextDirection == DirectionEnum.RIGHT) {
                    return true;
                }
                return this.checkYAxisCanMove(map);
            case DirectionEnum.RIGHT:
                if (this.nextDirection == DirectionEnum.LEFT) {
                    return true;
                }
                return this.checkYAxisCanMove(map);
            case DirectionEnum.STOPPED:
                if (this.checkXAxisCanMove(map)) {
                    return true;
                }
                if (this.checkYAxisCanMove(map)) {
                    return true;
                }

                return false;
        }
    

        return false;
    }

    checkXAxisCanMove(map) {
        if (!this.isAtIntersection(map)){
            return false;
        }

        var entityMapX = Math.floor(this.x / map.tileSize);
        var entityMapY = Math.floor(this.y / map.tileSize);

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

    checkYAxisCanMove(map) {
        if (!this.isAtIntersection(map)){
            return false;
        }

        var entityMapX = Math.floor(this.x / map.tileSize);
        var entityMapY = Math.floor(this.y / map.tileSize);

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

    isAtIntersection(map){
        if (this.x % map.tileSize == 0 && this.y % map.tileSize == 0){
            return true;
        }else{
            return false;
        }
    }

    collideLevel(map) {
        var x;
        var y;
        for (y = 0; y < map.levelData.length; y++) {
            for (x = 0; x < map.levelData[y].length; x++) {
                if (map.levelData[y][x] != 0 &&
                    this.didCollideRect(this.x + this.xvel, this.y + this.yvel, this.spriteSize, this.spriteSize, x * map.tileSize, y * map.tileSize, map.tileSize, map.tileSize)) {
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