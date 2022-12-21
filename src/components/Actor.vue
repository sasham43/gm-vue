<script>
export default {
  props: {
    type: String,
    position: String,
    tiles: Array,
    speed: Number,
  },
  data() {
    return {
      tileWidth: 50,
      tileHeight: 50,
      tileMarginBase: 4,
    };
  },
  computed: {
    xPos() {
      return this.position.split(",")[0];
    },
    yPos() {
      return this.position.split(",")[1];
    },
    currentTile() {
      return this.tiles[this.xPos][this.yPos];
    },
    tileMargin() {
      return this.tileMarginBase * 2;
    },
    left() {
      return `${(this.tileWidth + this.tileMargin) * this.xPos}px`;
    },
    top() {
      return `${(this.tileHeight + this.tileMargin) * this.yPos}px`;
    },
  },
};
</script>
<template>
  <div :style="{ top: top, left: left }" class="actor"></div>
</template>

<style scoped>
.actor {
  width: 25px;
  height: 25px;
  margin: 16px;
  border: solid 1px red;
  background-color: brown;

  position: absolute;
  pointer-events: none;
  transition: 0.2s all;
}
</style>
