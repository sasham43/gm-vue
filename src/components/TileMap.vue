<script>
export default {
  props: {
    tiles: Array,
  },
  methods: {
    selectTile(tile, row, col) {
      this.$emit("tileSelect", tile, row, col);
    },
  },
};
</script>

<template>
  <div>
    <div class="row" v-for="(row, rowIndex) in tiles">
      <div v-for="(tile, colIndex) in row">
        <Tile
          @click="selectTile(tile, rowIndex, colIndex)"
          v-bind="tile"
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
