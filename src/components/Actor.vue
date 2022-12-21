<script>
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
  },
};
</script>
<template>
  <div
    :style="{ top: top, left: left }"
    :class="{ enemy: this.isEnemy, dead: health <= 0 }"
    class="actor"
  ></div>
</template>

<style scoped>
.actor {
  width: 25px;
  height: 25px;
  margin: 18px;
  border: solid 1px aquamarine;
  background-color: darkturquoise;

  position: absolute;
  pointer-events: none;
  transition: 0.2s all;
}

.enemy {
  border: solid 1px red;
  background-color: brown;
}

.dead {
  background-color: black;
}
</style>
