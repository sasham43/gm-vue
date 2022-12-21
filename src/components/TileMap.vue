<script>
import Tile from "./Tile.vue";
import { isHighlightedTile } from "../utils/highlight";
export default {
  props: {
    tiles: Array,
    player: Object,
    mode: String,
  },
  computed: {
    playerX() {
      return this.player?.pos.split(",")[0];
    },
    playerY() {
      return this.player?.pos.split(",")[1];
    },
    currentTile() {
      return this.tiles[this.playerX][this.playerY];
    },
  },
  methods: {
    selectTile(tile, row, col) {
      // console.log("select row", row);
      // console.log("select col", col);
      let isNavigable = isHighlightedTile(
        tile,
        row,
        col,
        this.playerX,
        this.playerY,
        this.player.speed
      );
      this.$emit("tileSelect", tile, row, col, isNavigable);
    },
    // isHighlightedTile(tile, row, col) {
    //   let isWithinSpeed = false;
    //   if (this.mode === "player-move") {
    //     let xClose, yClose;

    //     if (col > this.playerX) {
    //       xClose = Math.abs(col - this.playerX);
    //     } else {
    //       xClose = Math.abs(this.playerX - col);
    //     }
    //     if (row > this.playerY) {
    //       yClose = Math.abs(row - this.playerY);
    //     } else {
    //       yClose = Math.abs(this.playerY - row);
    //     }

    //     if (xClose <= this.player.speed && yClose <= this.player.speed) {
    //       isWithinSpeed = true;
    //     }
    //   }
    //   return isWithinSpeed;
    // },
  },
  components: {
    Tile,
  },
};
</script>

<template>
  <div>
    <div class="row" v-for="(row, rowIndex) in tiles">
      <div v-for="(tile, colIndex) in row">
        <Tile
          @click="selectTile(tile, rowIndex, colIndex)"
          v-bind="tile"
          :row="rowIndex"
          :col="colIndex"
          :player="player"
          :mode="mode"
        ></Tile>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-direction: row;
}
</style>
