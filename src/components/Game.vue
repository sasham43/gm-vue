<script>
import TileMap from "./TileMap.vue";
import Actor from "./Actor.vue";
import {
  isHighlightedAttack,
  findDistance,
  isHighlightedMove,
} from "../utils/highlight";
import rollDice from "../utils/dice";

import _ from "lodash";

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
      // console.log("select", row, col, this.mode, isNavigable);

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
          this.nextTurn();
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
    findNeighboringTiles(actor) {
      let neighbors = [];

      if (this.tiles[actor.y][actor.x + 1]) {
        neighbors.push({
          x: actor.x + 1,
          y: actor.y,
        });
      }
      if (this.tiles[actor.y][actor.x - 1]) {
        neighbors.push({
          x: actor.x - 1,
          y: actor.y,
        });
      }
      if (
        this.tiles[actor.y + 1] != undefined &&
        this.tiles[actor.y + 1][actor.x]
      ) {
        neighbors.push({
          x: actor.x,
          y: actor.y + 1,
        });
      }
      if (
        this.tiles[actor.y - 1] != undefined &&
        this.tiles[actor.y - 1][actor.x]
      ) {
        neighbors.push({
          x: actor.x,
          y: actor.y - 1,
        });
      }

      return neighbors;

      // let neighbors = [
      //   this.tiles[actor.y][actor.x + 1],
      //   this.tiles[actor.y][actor.x - 1],
      //   this.tiles[actor.y + 1] != undefined
      //     ? this.tiles[actor.y + 1][actor.x]
      //     : undefined,
      //   this.tiles[actor.y - 1] != undefined
      //     ? this.tiles[actor.y - 1][actor.x]
      //     : undefined,
      // ];

      // return neighbors.filter((tile) => tile);
    },
    chooseLowestTotalScore(a, b) {
      if (a.totalScore > b.totalScore) return 1;
      if (a.totalScore < b.totalScore) return -1;
      return 0;
    },
    moveAlongPath(actor, path, range) {
      let step = 0;

      let steppingInterval = window.setInterval(function () {
        actor.x = path[step].x;
        actor.y = path[step].y;

        if (step == path.length - 1 || step == range) {
          window.clearInterval(steppingInterval);
        } else {
          step += 1;
        }
      }, 300);
    },
    findShortestPath(list) {
      let sorted = _.sortBy(list, "distanceFromStart").reverse();
      let start = sorted.shift();
      // console.log("start", start);
      // let nextSteps = sorted.filter((tile) => {
      //   return tile.distanceFromStart == start.distanceFromStart - 1;
      // });
      // console.log("next", nextSteps);
      let path = this.findNextPathStep(start, [], list);
      console.log("path:", path);
      return path;
    },
    findNextPathStep(start, pathList, closedList) {
      // let sorted = _.sortBy(closedList, "distanceFromStart").reverse();
      // let start = sorted.shift();
      console.log("start", start);
      let nextSteps = closedList.filter((tile) => {
        return tile.distanceFromStart == start.distanceFromStart - 1;
      });
      console.log("nextSteps", nextSteps);
      let next = nextSteps.find((step) => {
        let distance = findDistance(start.x, start.y, step.x, step.y).total;

        return distance === 1;
      });

      console.log("next", next, closedList);
      pathList.push(start);
      if (next.distanceFromStart === 0) {
        // pathList.push(next)
        return pathList;
      } else {
        return this.findNextPathStep(next, pathList, closedList);
      }
    },
    pathfinding(start, target, openList = [], closedList = [], loopNumber = 0) {
      // make sure compatible values are set
      start.pos = `${start.x},${start.y}`;
      start.distanceFromStart =
        start.distanceFromStart == undefined ? 0 : start.distanceFromStart;
      target.pos = `${target.x},${target.y}`;
      // get tiles N, E, S, W of actor, push to array
      let neighboringTiles = this.findNeighboringTiles(start);
      console.log("n", neighboringTiles);
      // loop through array, calculate distance from each tile towards player (as total x + total y)
      // if there are unnavigable tiles in the 'count', disregard or weight distance differently
      neighboringTiles = neighboringTiles.map((tile) => {
        let distanceToTarget = findDistance(
          tile.x,
          tile.y,
          target.x,
          target.y
        ).total;
        // console.log("pd", distanceToTarget);

        return {
          pos: `${tile.x},${tile.y}`,
          ...tile,
          distanceToTarget,
          distanceFromStart: start.distanceFromStart + 1,
        };
      });

      console.log("n2", neighboringTiles, openList, closedList, loopNumber);
      // return;

      // A* pathfinding
      openList = _.uniqBy([...openList, ...neighboringTiles], "pos");
      closedList = _.uniqBy([...closedList, start], "pos");
      // openList = [...openList, ...neighboringTiles];
      // closedList = [...closedList, start];

      // openList will be all available 'first moves' from a given origin (starting with actor starting point)

      // after tiles have been added to openList, calculate F as G + H (G = cost of moving into tile, distance from start; H = simple distance from target, e.g. playerDistance)
      openList = openList.map((tile) => {
        let totalScore = tile.distanceFromStart + tile.distanceToTarget;
        return {
          ...tile,
          totalScore,
        };
      });
      openList.sort(this.chooseLowestTotalScore);

      // choose  tile from openList lowest F score, add to closedList, retrieve adjacent squares from it
      let nextTile = openList.shift();

      // check if tile contains target
      if (nextTile.x == target.x && nextTile.y == target.y) {
        console.log(
          "found target",
          nextTile,
          closedList.map((c) => {
            return { pos: c.pos, distanceFromStart: c.distanceFromStart };
          })
        );

        return this.findShortestPath([...closedList, nextTile]).reverse();
      } else {
        return this.pathfinding(
          nextTile,
          target,
          openList,
          closedList,
          loopNumber + 1
        );
      }
    },
    moveTowardsPlayer(actor) {
      let result = this.pathfinding(actor, this.player);
      console.log("guess we path found", result);

      this.moveAlongPath(actor, result, actor.speed);

      // get tiles N, E, S, W of actor, push to array
      // let neighboringTiles = this.findNeighboringTiles(actor);
      // console.log("n", neighboringTiles);
      // // loop through array, calculate distance from each tile towards player (as total x + total y)
      // // if there are unnavigable tiles in the 'count', disregard or weight distance differently
      // neighboringTiles = neighboringTiles.map((tile) => {
      //   let distanceToPlayer = findDistance(
      //     tile.x,
      //     tile.y,
      //     this.player.x,
      //     this.player.y
      //   );
      //   // console.log("pd", distanceToPlayer);
      //   return {
      //     ...tile,
      //     distanceToPlayer,
      //     distanceFromStart: 1,
      //   };
      // });
      // // A* pathfinding
      // let openList = [...neighboringTiles];
      // let closedList = [actor];
      // // openList will be all available 'first moves' from a given origin (starting with actor starting point)
      // // after tiles have been added to openList, calculate F as G + H (G = cost of moving into tile, distance from start; H = simple distance from target, e.g. playerDistance)
      // openList = openList.map((tile) => {
      //   let totalScore = tile.distanceFromStart + tile.distanceToPlayer;
      //   return {
      //     ...tile,
      //     totalScore,
      //   };
      // });
      // openList.sort(this.chooseLowestTotalScore);
      // // choose  tile from openList lowest F score, add to closedList, retrieve adjacent squares from it
      // let nextTile = openList[0];
      // repeat as necessary until we get to the tile that holds the player, then work back through the closed list until we find the tile path we need
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      // get tiles we can move to
      // let highlightedTiles = [];
      // this.tiles.forEach((row, x) => {
      //   row.forEach((tile, y) => {
      //     let canMoveTo = isHighlightedMove(
      //       tile,
      //       y,
      //       x,
      //       actor.x,
      //       actor.y,
      //       actor.speed
      //     );
      //     if (canMoveTo) {
      //       highlightedTiles.push({
      //         x,
      //         y,
      //         playerDistance: findDistance(
      //           actor.x,
      //           actor.y,
      //           this.player.x,
      //           this.player.y
      //         ),
      //       });
      //     }
      //   });
      // });
      // highlightedTiles.sort((a, b) => {
      //   if (a.playerDistance.x > b.playerDistance.x) return 1;
      //   if (a.playerDistance.y > b.playerDistance.y) return 1;
      //   if (a.playerDistance.x < b.playerDistance.x) return -1;
      //   if (a.playerDistance.y < b.playerDistance.y) return -1;
      //   return 0;
      // });
      // console.log("hilgihgt", highlightedTiles);
      // actor.x = highlightedTiles[0].x;
      // actor.y = highlightedTiles[0].y;
      // this.currentActorMoved = true;
      // this.enemyTurn(actor);
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
