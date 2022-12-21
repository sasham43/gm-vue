<script>
export default {
  props: {
    tiles: Array,
  },
};
</script>

<template>
  <div>
    <div class="row" v-for="row in tiles">
      <div v-for="tile in row">
        <Tile v-bind="tile"></Tile>
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
