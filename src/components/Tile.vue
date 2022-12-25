<script>
import { isHighlightedAttack, isHighlightedMove } from "../utils/highlight";

export default {
  props: {
    y: Number,
    x: Number,
    player: Object,
    currentActor: Object,
    mode: String,
    tile: Number, // for now...
    height: Number,
    highlightedMoveTiles: Array,
    viewMode: String,
  },
  computed: {
    translate(){
      return `translate(${this.height * 50}px ${this.height * 50}px)`
    },
    playerX() {
      return this.player.x;
      // return this.player?.pos.split(",")[0];
    },
    playerY() {
      // console.log("this.player.y", this.player.y);
      return this.player.y;
      // return this.player?.pos.split(",")[1];
    },
    isHighlightedMove() {
      if (this.mode != "player-move" && this.mode != 'enemy-move') return false;

      let isHighlighted = this.highlightedMoveTiles.find(tile => {
        return tile.x === this.x && tile.y === this.y;
      })
      // console.log('is hhh', isHighlighted, this.x, this.y, this.highlightedMoveTiles)

      return isHighlighted;


      // // console.log("player mode", this.mode);

      // return isHighlightedMove(
      //   this.tile,
      //   this.y,
      //   this.x,
      //   this.currentActor.x,
      //   this.currentActor.y,
      //   this.currentActor.speed
      //   // this.playerX,
      //   // this.playerY,
      //   // this.player.speed
      // );
    },
    isHighlightedRangedAttack() {
      if (this.mode != "ranged") return false;
      return isHighlightedAttack(
        "ranged",
        this.x,
        this.y,
        // this.playerX,
        // this.playerY,
        this.currentActor.x,
        this.currentActor.y,
        this.currentActor.selectedAttack.range,        
      );
    },
    isHighlightedMeleeAttack() {
      if (this.mode != "melee") return false;
      return isHighlightedAttack(
        "melee",
        this.x,
        this.y,
        // this.playerX,
        // this.playerY

        this.currentActor.x,
        this.currentActor.y,
      );
    },
    isHighlightedAttack() {
      return this.isHighlightedMeleeAttack || this.isHighlightedRangedAttack;
    },
    leftTranslate(){
      if(this.height == 1){
        return '17.5'
      } else if (this.height == 2){
        return '67'
      }
    },
    rightTranslate(){
      if (this.height == 1) {
        return 'translate(14px, -77px)'
      } else if (this.height == 2){
        return 'translate(-38px, -128px)'
      }
    },
    heightTranslate(){
      if(this.viewMode === 'isometric'){
        return `translate(-${this.height * 50}px, -${this.height * 50}px)`
      } else {
        return `translate(0px)`
      }
    },
    heightFilter(){
      return `brightness(${(this.height * 20) + 50}%)`
    }
  },
  mounted(){
    // console.log("height", this.height)
  }
};
</script>

<template>
  <div>
    <div
      class="tile"
      :class="{
        'empty-tile': tile === 0,
        'filled-tile': tile === 1,
        'enemy': currentActor.enemy,
        'highlighted-move-tile': isHighlightedMove,
        'highlighted-attack-tile': isHighlightedAttack,
      }"
      :style="{ 'transform': heightTranslate, 'filter': heightFilter }"
    >
      <!-- <span class="debug"> {{ row }} - {{ col }} </span> -->
      <!-- <span>{{ `translate(${height * 50}px ${height * 50}px)` }}</span> -->
    </div>
    <div v-if="height > 0 && viewMode === 'isometric'" class="left-side-tile" :style="{ 'transform': `translate(-${leftTranslate}px, -${height * 50}px) skew(45deg, 0deg)`, 'filter': heightFilter }"></div>
    <div v-if="height > 0 && viewMode === 'isometric'" class="right-side-tile"
      :style="{ 'transform': `${rightTranslate} skew(0deg, 45deg)`, 'filter': heightFilter }"></div>
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
  cursor: pointer;
}
.tile:hover {
  border-color: #fff !important;
}
.right-side-tile,
.left-side-tile {
    width: 50px;
    height: 50px;
    background-color: green;
    /* transform: translate(-67px, -100px) skew(44deg, 0deg); */
    position: absolute;
}
/* .right-side-tile {
  background-color: red;

    transform: translate(-38px, -127px) skew(0deg, 45deg);
} */
.empty-tile {
  background-color: black;
}
.highlighted-move-tile {
  border-color: blue !important;
}
.enemy.highlighted-move-tile {
  border-color: orange !important;
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
