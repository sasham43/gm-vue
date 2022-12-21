<script>
import { isHighlightedAttack, isHighlightedMove } from "../utils/highlight";

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
    isHighlightedMove() {
      if (this.mode != "player-move") return false;
      // console.log("player mode", this.mode);

      return isHighlightedMove(
        this.tile,
        this.row,
        this.col,
        this.playerX,
        this.playerY,
        this.player.speed
      );

      // else if (this.mode == "attack") {
      //   return isHighlightedAttack(
      //     "melee",
      //     this.col,
      //     this.row,
      //     this.playerX,
      //     this.playerY
      //   );
      // }
    },
    isHighlightedRangedAttack() {
      if (this.mode != "ranged") return false;
      return isHighlightedAttack(
        "ranged",
        this.col,
        this.row,
        this.playerX,
        this.playerY,
        2
      );
    },
    isHighlightedMeleeAttack() {
      if (this.mode != "melee") return false;
      return isHighlightedAttack(
        "melee",
        this.col,
        this.row,
        this.playerX,
        this.playerY
      );
    },
    isHighlightedAttack() {
      return this.isHighlightedMeleeAttack || this.isHighlightedRangedAttack;
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
      'highlighted-move-tile': isHighlightedMove,
      'highlighted-attack-tile': isHighlightedAttack,
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
  border-width: 2px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0);
}
.empty-tile {
  background-color: black;
}
.highlighted-move-tile {
  border-color: blue !important;
}
.highlighted-attack-tile {
  border-color: red !important;
}

.debug {
  position: absolute;
  width: 50px;
  left: 0px;
}
</style>
