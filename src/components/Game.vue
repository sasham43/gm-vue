<script>
import TileMap from "./TileMap.vue";
import Actor from "./Actor.vue";

export default {
  data() {
    return {
      tiles: [
        [1, 1, 1, 1, 1],
        [1, 1, 0, 1, 1],
        [1, 1, 0, 1, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 1, 1, 1],
      ],
      player: {
        pos: "1,2",
        speed: 1,
      },
      //   playerPos: "1,2",
      mode: "free",
      enemies: [
        {
          x: 4,
          y: 4,
          speed: 1,
          attack: "melee",
        },
      ],
    };
  },
  computed: {
    playerX() {
      return this.player.pos.split(",")[0];
    },
    playerY() {
      return this.player.pos.split(",")[1];
    },
    currentTile() {
      return this.tiles[this.playerX][this.playerY];
    },
  },
  methods: {
    onTileSelect(tile, row, col, isNavigable) {
      let selectPos = `${col},${row}`;

      if (this.mode == "free") {
        if (selectPos == this.player.pos) {
          this.mode = "player-move";
        }
      } else if (this.mode == "player-move") {
        if (isNavigable) {
          this.movePlayer(selectPos);
        }
      }
      // add attacks here

      this.setMode("free");
    },
    movePlayer(targetPos) {
      this.player.pos = targetPos;

      // let moveDelay = 200;
      // window.setTimeout(() => {
      // this.mode = "free";
      // }, moveDelay);
    },
    setMode(mode) {
      if (this.mode === mode) {
        this.mode = "free";
      } else {
        this.mode = mode;
      }
    },
  },
  components: { TileMap, Actor },
};
</script>

<template>
  <div>
    {{ mode }}
  </div>
  <div>
    <button @click="setMode('melee')">melee</button>
    <button @click="setMode('ranged')">ranged</button>
    <button @click="setMode('player-move')">player move</button>
  </div>
  <div class="tilemap">
    <TileMap
      @tile-select="onTileSelect"
      :player="player"
      :tiles="tiles"
      :mode="mode"
    ></TileMap>
    <Actor :position="player.pos" :speed="player.speed" :tiles="tiles"></Actor>
    <Actor v-for="enemy in enemies" :isEnemy="true" v-bind="enemy"></Actor>
  </div>
</template>

<style scoped>
.tilemap {
  position: relative;
}
</style>
