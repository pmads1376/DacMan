class Player extends Actor {
    constructor(x, y, speed, currentGraphic, startDirection){
        super(x, y, speed, currentGraphic, startDirection);

        this.lives = 3;
    }

    update(map) {
        if (this.alive){
            this.collideWithPickup();
            this.collideWithEnemy();
            super.update(map);
        }
        
    }

    collideWithEnemy(){
        game.enemies.forEach((enemy)=>{
            if (!enemy.isFrightened && this.didCollideRect(this.x, this.y, this.spriteSize, this.spriteSize, enemy.x, enemy.y, enemy.spriteSize, enemy.spriteSize)){
                this.alive = false;
            }
        });
    }

    collideWithPickup() {
        for (var i = 0; i < game.pickups.length; i++) {
            var pickup = game.pickups[i];

            if (pickup.alive && this.x == pickup.x && this.y == pickup.y) {
                game.score = game.score + pickup.getScore();
                game.pickups[i].alive = false;
                game.pickupsRemaining--;

                if (pickup instanceof Special) {
                    itemCollection.push(pickup.currentGraphic);
                    let html = itemCollection.map(item => {
                        return '<img src="' + item.src + '">'
                    }).reduce((acc, img) => acc + img);

                    document.getElementById("item-collection").innerHTML = html;
                }
            }

            if (game.pickupsRemaining === 0) {
                game.currentState = GameStateEnum.LEVEL_COMPLETE;
            }
        }
    }
}