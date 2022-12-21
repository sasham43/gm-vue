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
    };
  },
  components: { TileMap, Actor },
};
</script>

<template>
  <div class="tilemap">
    <TileMap :tiles="tiles"></TileMap>
    <Actor position="0,0" :tiles="tiles"></Actor>
  </div>
</template>

<style scoped>
.tilemap {
  position: relative;
}
</style>
