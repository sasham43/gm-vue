<script>
import TileMap from "./TileMap.vue";

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
  components: { TileMap },
};
</script>

<template>
  <TileMap :tiles="tiles"></TileMap>
</template>
