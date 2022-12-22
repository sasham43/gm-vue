<script>
import TileMap from "./TileMap.vue";
import Actor from "./Actor.vue";
import {
  isHighlightedAttack,
  findDistance,
  isHighlightedMove,
} from "../utils/highlight";
import rollDice from "../utils/dice";

export default {
  data() {
    return {
      currentTurn: 0,
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
        // pos: "1,2",
        x: 1,
        y: 2,
        speed: 1,
        meleePower: 2,
        health: 10,
        healthMax: 10,
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
          healthMax: 4,
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
          healthMax: 4,
          initiative: 0,
          range: 2,
          rangedPower: 2,
        },
      ],
      turnOrder: [],
      currentActorMoved: false,
      currentActorAttacked: false,
    };
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
    nextTurn() {
      if (this.currentTurn === this.turnOrder.length - 1) {
        this.currentTurn = 0;
      } else {
        this.currentTurn += 1;
      }
    },
    previousTurn() {
      if (this.currentTurn == 0) {
        this.currentTurn = this.turnOrder.length - 1;
      } else {
        this.currentTurn -= 1;
      }
    },
    onTileSelect(tile, row, col, isNavigable) {
      let selectPos = `${col},${row}`;
      console.log("select", row, col, this.mode, isNavigable);

      if (this.mode == "free") {
        if (selectPos == this.player.pos) {
          this.mode = "player-move";
        }
      } else if (this.mode == "player-move") {
        if (isNavigable) {
          this.movePlayer(col, row);
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
          enemy.health -= this.player.rangedPower;
        }
      }

      this.setMode("free");
    },
    findEnemyPos(selectPos) {
      return this.enemies.find((enemy) => {
        return `${enemy.x},${enemy.y}` === selectPos;
      });
    },
    movePlayer(x, y) {
      this.player.x = x;
      this.player.y = y;
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
      this.player.initiative = d20.total;

      this.enemies = this.enemies.map((enemy) => {
        enemy.initiative = rollDice("1d20").total;
        return enemy;
      });
      let initiativeRolls = [this.player, ...this.enemies].sort((a, b) => {
        if (a.initiative > b.initiative) return 1;
        if (a.initiative < b.initiative) return -1;
        return 0;
      });

      this.turnOrder = initiativeRolls; //.map((a) => a.name);
      // this.turnOrder = initiativeRolls.map((a) => a.name);

      this.watchCurrentTurn(0); // start turns
    },
    watchCurrentTurn(newValue, oldValue) {
      let currentActor = this.turnOrder[newValue];
      // let currentActor = console.log("current Actor", currentActor);

      if (currentActor.player) {
        // wait for player input
        console.log("player turn");
      } else {
        // AI actions
        console.log("enemy turn");
        this.enemyTurn(currentActor);
      }
    },
    enemyTurn(actor) {
      // check if can attack player
      if (actor.attack == "ranged") {
        // let playerDistance = findDistance(
        //   actor.x,
        //   actor.y,
        //   this.player.x,
        //   this.player.y,
        //   actor.range
        // );
        let isAttackable = isHighlightedAttack(
          "ranged",
          this.player.x,
          this.player.y,
          actor.x,
          actor.y,
          actor.range
        );
        console.log("is attackable", isAttackable);
        if (!isAttackable) {
          console.log("too far, moving");
          if (this.currentActorMoved) {
            this.nextTurn();
          } else {
            this.enemyChoice(() => {
              this.moveTowardsPlayer(actor);
            });
          }
        } else {
          // attack
          console.log("ranged attack");
          this.enemyChoice(() => {
            this.player.health -= actor.rangedPower;
            console.log("player health:", this.player.health);
            this.nextTurn();
          });
        }

        // console.log("player dist", playerDistance, actor.range);
        // if (playerDistance.x > actor.range && playerDistance.y > actor.range) {
        //   console.log("too far, moving");
        //   if (this.currentActorMoved) {
        //     this.nextTurn();
        //   } else {
        //     this.enemyChoice(() => {
        //       this.moveTowardsPlayer(actor);
        //     });
        //   }
        // } else {
        //   // attack
        //   console.log("ranged attack");
        //   this.enemyChoice(() => {
        //     this.player.health -= actor.rangedPower;
        //   });
        //   this.nextTurn();
        // }
      }
    },
    enemyChoice(action) {
      let enemyDecisionSpeed = 2000;

      window.setTimeout(() => {
        console.log("choice");
        action();
      }, enemyDecisionSpeed);
    },
    moveTowardsPlayer(actor) {
      // get tiles we can move to
      let highlightedTiles = [];
      this.tiles.forEach((row, x) => {
        row.forEach((tile, y) => {
          let canMoveTo = isHighlightedMove(
            tile,
            y,
            x,
            actor.x,
            actor.y,
            actor.speed
          );
          if (canMoveTo) {
            highlightedTiles.push({
              x,
              y,
              playerDistance: findDistance(
                actor.x,
                actor.y,
                this.player.x,
                this.player.y
              ),
            });
          }
        });
      });

      highlightedTiles.sort((a, b) => {
        if (a.playerDistance.x > b.playerDistance.x) return 1;
        if (a.playerDistance.y > b.playerDistance.y) return 1;
        if (a.playerDistance.x < b.playerDistance.x) return -1;
        if (a.playerDistance.y < b.playerDistance.y) return -1;
        return 0;
      });

      console.log("hilgihgt", highlightedTiles);

      actor.x = highlightedTiles[0].x;
      actor.y = highlightedTiles[0].y;

      this.currentActorMoved = true;

      this.enemyTurn(actor);
    },
  },
  watch: {
    currentTurn(newValue, oldValue) {
      return this.watchCurrentTurn(newValue, oldValue);
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
    <Actor v-bind="player" :tiles="tiles"></Actor>
    <Actor v-for="enemy in enemies" :isEnemy="true" v-bind="enemy"></Actor>
  </div>
  <div>
    <button @click="previousTurn()">&lt; turn</button>
    <button @click="rollInitiative()">battle</button>
    <button @click="nextTurn()">> turn</button>
    <div>
      <div
        class="turn"
        :class="{ 'current-turn': currentTurn == turn }"
        v-for="(actor, turn) in turnOrder"
      >
        {{ actor.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.tilemap {
  position: relative;
}
.turn {
  border-width: 2px;
  border-color: rgba(0, 0, 0, 0);
  border-style: solid;
}
.current-turn {
  border-color: blueviolet;
}
</style>
