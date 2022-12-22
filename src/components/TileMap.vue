<script>
import Tile from "./Tile.vue";
import { isHighlightedMove } from "../utils/highlight";
export default {
  props: {
    tiles: Array,
    player: Object,
    mode: String,
  },
  computed: {
    playerX() {
      return this.player.x;
      // return this.player?.pos.split(",")[0];
    },
    playerY() {
      return this.player.y;
      // return this.player?.pos.split(",")[1];
    },
    currentTile() {
      return this.tiles[this.playerX][this.playerY];
    },
  },
  methods: {
    selectTile(tile, y, x) {
      // console.log("x", x);
      // console.log("y", y);
      console.log("x,y", x, y);
      let isNavigable = isHighlightedMove(
        tile,
        y,
        x,
        this.playerX,
        this.playerY,
        this.player.speed
      );
      this.$emit("tileSelect", tile, y, x, isNavigable);
    },
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
          :tile="tile"
          :y="rowIndex"
          :x="colIndex"
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
