class Sprite {
    constructor(x, y, currentGraphic) {
        this.currentGraphic = currentGraphic;
        this.spriteSize = spriteSize
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