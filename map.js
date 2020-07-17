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