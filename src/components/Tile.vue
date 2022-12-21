<script>
import { isHighlightedTile } from "../utils/highlight";

export default {
  props: {
    row: Number,
    col: Number,
    player: Object,
    mode: String,
    tile: Number, // for now...
  },
  computed: {
    playerX() {
      return this.player?.pos.split(",")[0];
    },
    playerY() {
      return this.player?.pos.split(",")[1];
    },
    isHighlightedTile() {
      if (this.mode != "player-move") return false;
      console.log("player mode", this.mode);

      return isHighlightedTile(
        this.tile,
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
      'empty-tile': tile === 0,
      'filled-tile': tile === 1,
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
.empty-tile {
  background-color: black;
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
