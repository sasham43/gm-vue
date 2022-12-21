<script>
import TileMap from "./TileMap.vue";
import Actor from "./Actor.vue";
import { isHighlightedAttack } from "../utils/highlight";
import rollDice from "../utils/dice";

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
        player: true,
        name: "Hero",
        pos: "1,2",
        speed: 1,
        meleePower: 2,
        rangedPower: 1,
        range: 2,
        initiative: 0,
      },
      //   playerPos: "1,2",
      mode: "free",
      enemies: [
        {
          enemy: true,
          name: "Blognord",
          x: 4,
          y: 4,
          speed: 1,
          attack: "melee",
          health: 4,
          initiative: 0,
        },
        {
          enemy: true,
          name: "Globnord",
          x: 4,
          y: 0,
          speed: 1,
          attack: "ranged",
          health: 4,
          initiative: 0,
        },
      ],
      turnOrder: [],
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
      } else if (this.mode == "melee") {
        let isAttackable = isHighlightedAttack(
          "melee",
          col,
          row,
          this.playerX,
          this.playerY
        );

        let enemy = this.findEnemyPos(selectPos);

        if (isAttackable && enemy) {
          // console.log("attack");
          enemy.health -= this.player.meleePower;
        }
      } else if (this.mode == "ranged") {
        let isAttackable = isHighlightedAttack(
          "ranged",
          col,
          row,
          this.playerX,
          this.playerY,
          this.player.range
        );

        let enemy = this.findEnemyPos(selectPos);

        if (isAttackable && enemy) {
          // console.log("attack");
          enemy.health -= this.player.rangedPower;
        }
      }
      // add attacks here

      this.setMode("free");
    },
    findEnemyPos(selectPos) {
      return this.enemies.find((enemy) => {
        return `${enemy.x},${enemy.y}` === selectPos;
      });
    },
    movePlayer(targetPos) {
      this.player.pos = targetPos;
    },
    setMode(mode) {
      if (this.mode === mode) {
        this.mode = "free";
      } else {
        this.mode = mode;
      }
    },
    rollInitiative() {
      let d20 = rollDice("1d20");

      // console.log("init", d20);

      this.player.initiative = d20.total; //rollDice("1d20").total;

      // console.log("player", this.player);

      this.enemies = this.enemies.map((enemy) => {
        enemy.initiative = rollDice("1d20").total;
        return enemy;
      });
      // console.log("enemies", this.enemies);
      let initiativeRolls = [this.player, ...this.enemies].sort((a, b) => {
        // console.log("a", a.initative, b.initative);
        if (a.initiative > b.initiative) return 1;
        if (a.initiative < b.initiative) return -1;
        return 0;
      });

      console.log(
        "init",
        initiativeRolls.map((a) => a.name)
      );

      this.turnOrder = initiativeRolls.map((a) => a.name);
    },
  },
  components: { TileMap, Actor },
};
</script>

<template>
  <!-- <div>
    {{ mode }}
  </div> -->
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
  <div>
    <button @click="rollInitiative()">battle</button>
    <div>
      <div v-for="name in turnOrder">
        {{ name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.tilemap {
  position: relative;
}
</style>
