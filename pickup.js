class Pickup extends Sprite {
    constructor(x, y, currentGraphic) {
        super(x, y, currentGraphic || pickupImage)
    }

    getScore() {
        return 10;
    }
}