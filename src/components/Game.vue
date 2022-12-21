<script>
import TileMap from "./TileMap.vue";
import Actor from "./Actor.vue";

export default {
  data() {
    return {
      tiles: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      playerPos: "1,2",
      mode: "free",
    };
  },
  computed: {
    playerX() {
      return this.playerPos.split(",")[0];
    },
    playerY() {
      return this.playerPos.split(",")[1];
    },
    currentTile() {
      return this.tiles[this.playerX][this.playerY];
    },
  },
  methods: {
    onTileSelect(tile, row, col) {
      //   console.log("select", tile, row, col);
      let selectPos = `${col},${row}`;

      if (this.mode == "free") {
        if (selectPos == this.playerPos) {
          // console.log("select player");
          this.mode = "player-move";
        }
      } else if (this.mode == "player-move") {
        // this.playerPos = selectPos;
        this.movePlayer(selectPos);
      }
    },
    movePlayer(targetPos) {
      this.playerPos = targetPos;
      this.mode = "free";
    },
  },
  components: { TileMap, Actor },
};
</script>

<template>
  <div>
    {{ mode }}
  </div>
  <div class="tilemap">
    <TileMap @tile-select="onTileSelect" :tiles="tiles"></TileMap>
    <Actor :position="playerPos" :speed="2" :tiles="tiles"></Actor>
  </div>
</template>

<style scoped>
.tilemap {
  position: relative;
}
</style>
