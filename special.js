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