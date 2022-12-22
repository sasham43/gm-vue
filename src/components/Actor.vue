<script>
import Sprite from "./Sprite.vue";
export default {
  props: {
    type: String,
    position: String,
    tiles: Array,
    speed: Number,
    x: Number,
    y: Number,
    isEnemy: Boolean,
    health: Number,
    sprite: String,
    spritePose: {
      type: String,
      default: "standing",
    },
  },
  data() {
    return {
      tileWidth: 50,
      tileHeight: 50,
      tileBorderBase: 2,
      tileMarginBase: 4,
    };
  },
  computed: {
    xPos() {
      if (this.position) {
        return this.position?.split(",")[0];
      } else {
        return this.x;
      }
    },
    yPos() {
      if (this.position) {
        return this.position?.split(",")[1];
      } else {
        return this.y;
      }
    },
    currentTile() {
      return this.tiles[this.xPos][this.yPos];
    },
    tileBorder() {
      return this.tileBorderBase * 2;
    },
    tileMargin() {
      return this.tileMarginBase * 2;
    },
    left() {
      return `${
        (this.tileWidth + this.tileMargin + this.tileBorder) * this.xPos
      }px`;
    },
    top() {
      return `${
        (this.tileHeight + this.tileMargin + this.tileBorder) * this.yPos
      }px`;
    },
    pose(){
      if(this.health <= 0){
        return 'standing'
      } else {
        return this.spritePose;
      }
    }
  },
  components: {
    Sprite,
  },
};
</script>
<template>
  <div
    :style="{ top: top, left: left }"
    :class="{ enemy: this.isEnemy, dead: health <= 0 }"
    class="actor"
  >
    <Sprite :spritesheet="sprite" :pose="pose"></Sprite>
  </div>
</template>

<style scoped>
.actor {
  width: 24px;
  height: 24px;
  margin: 18px;
  border: solid 1px rgba(0, 0, 0, 0);
  /* border: solid 1px aquamarine;
  background-color: darkturquoise; */

  position: absolute;
  pointer-events: none;
  transition: 0.2s all;
  transform: scale(1.5);
}

.enemy {
  /* border: solid 1px red;
  background-color: brown; */
}

.dead {
  background-color: black;
}
</style>
