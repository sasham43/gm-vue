<script>
import { isHighlightedTile } from "../utils/highlight";

export default {
  props: {
    row: Number,
    col: Number,
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
    isHighlightedTile() {
      // let isWithinSpeed = false;
      // if (this.mode === "player-move") {
      //   let xClose, yClose;

      //   if (this.col > this.playerX) {
      //     xClose = Math.abs(this.col - this.playerX);
      //   } else {
      //     xClose = Math.abs(this.playerX - this.col);
      //   }
      //   if (this.row > this.playerY) {
      //     yClose = Math.abs(this.row - this.playerY);
      //   } else {
      //     yClose = Math.abs(this.playerY - this.row);
      //   }

      //   if (xClose <= this.player.speed && yClose <= this.player.speed) {
      //     isWithinSpeed = true;
      //   }
      // }
      // return isWithinSpeed;
      return isHighlightedTile(
        0,
        this.row,
        this.col,
        this.playerX,
        this.playerY,
        this.player.speed
      );
    },
  },
};
</script>

<template>
  <div
    class="tile"
    :class="{
      'highlighted-tile': isHighlightedTile,
    }"
  >
    <!-- <span class="debug"> {{ row }} - {{ col }} </span> -->
  </div>
</template>

<style scoped>
.tile {
  width: 50px;
  height: 50px;
  background-color: green;
  margin: 4px;
  position: relative;
}
.highlighted-tile {
  background-color: blue !important;
}

.debug {
  position: absolute;
  width: 50px;
  left: 0px;
}
</style>
