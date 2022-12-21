<script>
export default {
  props: {
    type: String,
    position: String,
    tiles: Array,
  },
  data() {
    return {
      //   top: 0,
      //   left: 0,
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
      //   let xPos = this.position.split(",")[0];
      //   let yPos = this.position.split(",")[1];

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
  //   methods: {
  //     findPos() {
  //       let tileWidth = 50;
  //       let tileHeight = 50;
  //       let tileMargin = 4 * 2;

  //       let left = (tileWidth + tileMargin) * this.xPos;
  //       let top = (tileHeight + tileMargin) * this.yPos;

  //       console.log("left", left);
  //       console.log("top", top);
  //       this.left = left;
  //       this.top = top;
  //       //   this.left = (tileWidth + tileMargin) * this.xPos;
  //       //   this.top = (tileHeight + tileMargin) * this.yPos;
  //     },
  //   },
  //   created() {
  //     this.findPos();
  //   },
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
}
</style>
