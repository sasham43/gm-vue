<script>
import TileMap from "./TileMap.vue";
import Actor from "./Actor.vue";
import Sprite from "./Sprite.vue";
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
        sprite: "src/assets/hero-1.png",
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
          meleePower: 2,
          health: 4,
          healthMax: 4,
          initiative: 0,
          sprite: "src/assets/enemy-1.png",
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
          sprite: "src/assets/enemy-2.png",
        },
      ],
      turnOrder: [],
      currentActor: {},
      currentActorMoved: false,
      currentActorAttacked: false,
      enemyChoiceTimeout: null,
      currentDefender: {},
      showAttackInfo: false,
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

      this.currentActorAttacked = false;
      this.currentActorMoved = false;

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
    playerAttack(){
          this.currentDefender.health -= this.player.attackPower;
          this.currentActorAttacked = true;
    },
    onTileSelect(tile, row, col, isNavigable) {
      let selectPos = `${col},${row}`;
      // console.log("select", row, col, this.mode, isNavigable);

      if (this.mode == "free") {
        if (selectPos == this.player.pos) {
          this.mode = "player-move";
        }
      } else if (this.mode == "player-move") {
        // console.log('select player move')
        if (isNavigable) {
          this.movePlayer(col, row);
          this.currentActorMoved = true;
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
          this.currentDefender = enemy;
          this.player.attackPower = this.player.meleePower;
          this.displayAttackView();
          // enemy.health -= this.player.meleePower;
          // this.currentActorAttacked = true;
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
          this.currentDefender = enemy;
          this.player.attackPower = this.player.rangedPower;
          this.displayAttackView();
          // enemy.health -= this.player.rangedPower;
          // this.currentActorAttacked = true;
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
      let result = this.pathfinding(this.player, { x, y });

      this.moveAlongPath(this.player, result, this.player.speed);
    },
    setMode(mode) {
      // if (this.mode === mode) {
      //   this.mode = "free";
      // } else {
        this.mode = mode;
      // }
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

      this.turnOrder = initiativeRolls;

      this.watchCurrentTurn(0); // start turns
    },
    watchCurrentTurn(newValue, oldValue) {
      let currentActor = this.turnOrder[newValue];



      if (currentActor.health <= 0) {
        console.log('current actor health 0', currentActor)
        this.nextTurn();
      }

      this.currentActor = currentActor;
      this.currentDefender = {}

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
      this.currentDefender = this.player;
      // check if can attack player
      if (actor.attack == "ranged") {
        let isAttackable = isHighlightedAttack(
          "ranged",
          this.player.x,
          this.player.y,
          actor.x,
          actor.y,
          actor.range
        );
        // console.log("is attackable", isAttackable);
        if (!isAttackable) {
          // console.log("too far, moving");
          if (this.currentActorMoved) {
            this.nextTurn();
          } else {
            this.setMode('enemy-move')
            this.enemyChoice(() => {
              this.moveTowardsPlayer(actor);
              this.currentActorMoved = true;
              this.enemyTurn(actor);
            });
          }
        } else {
          // attack
          if (this.currentActorAttacked) {
            this.nextTurn();
          } else {
            // console.log("ranged attack");
            this.enemyChoice(() => {
              this.player.health -= actor.rangedPower;
              // console.log("player health:", this.player.health);
              // this.nextTurn();
              this.currentActorAttacked = true;
              this.enemyTurn(actor);
            });
          }
        }
      } else if (actor.attack == "melee") {
        let isAttackable = isHighlightedAttack(
          "melee",
          this.player.x,
          this.player.y,
          actor.x,
          actor.y
        );
        // console.log("is attackable", isAttackable);
        if (!isAttackable) {
          // console.log("too far, moving");
          if (this.currentActorMoved) {
            this.nextTurn();
          } else {
            this.setMode('enemy-move')
            this.enemyChoice(() => {
              this.moveTowardsPlayer(actor);
              this.currentActorMoved = true;
              this.enemyTurn(actor);
            });
          }
        } else {
          // attack
          if (this.currentActorAttacked) {
            this.nextTurn();
          } else {
            // console.log("melee attack");
            this.enemyChoice(() => {
              this.player.health -= actor.meleePower;
              // console.log("player health:", this.player.health);
              this.currentActorAttacked = true;
              this.enemyTurn(actor);
            });
          }
        }
      }
    },
    enemyChoice(action) {
      let enemyDecisionSpeed = 2000;

      window.clearTimeout(this.enemyChoiceTimeout)

      this.enemyChoiceTimeout = window.setTimeout(() => {
        // console.log("choice");
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
    },
    chooseLowestTotalScore(a, b) {
      if (a.totalScore > b.totalScore) return 1;
      if (a.totalScore < b.totalScore) return -1;
      return 0;
    },
    moveAlongPath(actor, path, range) {
      let step = 0;

      let steppingInterval = window.setInterval(function () {
        // calculate sprite direction
        // console.log("actor", actor.x, path[step].x, actor.y, path[step].y);
        let spriteDirection = "";
        if (actor.x == path[step].x && actor.y > path[step].y) {
          spriteDirection = "n-walk";
        } else if (actor.x == path[step].x && actor.y < path[step].y) {
          spriteDirection = "s-walk";
        } else if (actor.x > path[step].x && actor.y == path[step].y) {
          spriteDirection = "w-walk";
        } else if (actor.x == path[step].x && actor.y == path[step].y) {
          spriteDirection = "e-walk";
        }
        actor.spritePose = spriteDirection;
        // check if in attack range and break loop
        actor.x = path[step].x;
        actor.y = path[step].y;

        if (step == path.length - 1 || step == (range-1)) {
          window.clearInterval(steppingInterval);
        } else {
          step += 1;
        }
      }, 300);
    },
    findShortestPath(list) {
      let sorted = _.sortBy(list, "distanceFromStart").reverse();
      let start = sorted.shift();
      let path = this.findNextPathStep(start, [], list);
      return path;
    },
    findNextPathStep(start, pathList, closedList) {
      let nextSteps = closedList.filter((tile) => {
        return tile.distanceFromStart == start.distanceFromStart - 1;
      });

      let next = nextSteps.find((step) => {
        let distance = findDistance(start.x, start.y, step.x, step.y).total;
        return distance === 1;
      });

      pathList.push(start);
      if (next.distanceFromStart === 0) {
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
      // loop through array, calculate distance from each tile towards player (as total x + total y)
      // if there are unnavigable tiles in the 'count', disregard or weight distance differently
      neighboringTiles = neighboringTiles.map((tile) => {
        let distanceToTarget = findDistance(
          tile.x,
          tile.y,
          target.x,
          target.y
        ).total;

        return {
          pos: `${tile.x},${tile.y}`,
          ...tile,
          distanceToTarget,
          distanceFromStart: start.distanceFromStart + 1,
        };
      });

      // A* pathfinding
      // openList will be all available 'first moves' from a given origin (starting with actor starting point)
      openList = _.uniqBy([...openList, ...neighboringTiles], "pos");
      closedList = _.uniqBy([...closedList, start], "pos");

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
      // console.log("path lenght", result.length);
      // remove last piece of route because we don't want to move ontop of player
      result.pop();

      // console.log("result", result, actor);

      this.moveAlongPath(actor, result, actor.speed);
    },
    watchCurrentActorActions() {
      if (this.currentActorAttacked && this.currentActorMoved) {
        this.nextTurn();
      }
    },
    displayAttackView(){
      // here
      this.showAttackInfo = true;
    }
  },
  watch: {
    currentTurn(newValue, oldValue) {
      return this.watchCurrentTurn(newValue, oldValue);
    },
    currentActorAttacked() {
      return this.watchCurrentActorActions();
    },
    currentActorMoved() {
      return this.watchCurrentActorActions();
    },
  },
  components: { TileMap, Actor, Sprite },
};
</script>

<template>

  <div>
    <button @click="previousTurn()">&lt; turn</button>
    <button @click="rollInitiative()">battle</button>
    <button @click="nextTurn()">> turn</button>
    <div>
      <div class="turn" :class="{ 'current-turn': currentTurn == turn }" v-for="(actor, turn) in turnOrder">
        {{ actor.name }}
      </div>
    </div>
  </div>
  <div>
    <div>
      <button @click="setMode('melee')" :disabled="currentActor.player && currentActorAttacked">melee</button>
      <button @click="setMode('ranged')" :disabled="currentActor.player && currentActorAttacked">ranged</button>
      <button @click="setMode('player-move')">player move</button>
    </div>
    <div class="tilemap">
      <TileMap
        @tile-select="onTileSelect"
        :player="player"
        :currentActor="currentActor"
        :tiles="tiles"
        :mode="mode"
      ></TileMap>
      <Actor v-bind="player" :tiles="tiles"></Actor>
      <Actor v-for="enemy in enemies" :isEnemy="true" v-bind="enemy"></Actor>
    </div>
  </div>
  <div class="attack-view-container">
    <div class="attacker" :class="{'player-view': currentActor.player, 'enemy-view': currentActor.enemy}">
      <div>
        Attacker: {{ currentActor.name }}
      </div>
      <div :class="{'show-attack-info': showAttackInfo}" class="attack-info">
        Power: {{ currentActor.attackPower }}
      </div>
      <div :class="{'show-attack-info': showAttackInfo}" class="attack-info">
        <button class="attack-button" @click="playerAttack()">
          Attack
        </button>
      </div>
      <div class="attack-view-sprite-container">
        <Sprite :spritesheet="currentActor.sprite" pose="standing"></Sprite>
      </div>
    </div>
    <div class="defender" :class="{'player-view': currentDefender.player, 'enemy-view': currentDefender.enemy}">
      <div>
        Defender: {{ currentDefender.name }}
      </div>
      <div :class="{'show-attack-info': showAttackInfo}" class="attack-info">
        Health: {{ currentDefender.health }}
      </div>

      <div>
        <button class="defend-button">
          Defend
        </button>
      </div>
      <div class="attack-view-sprite-container">
        <Sprite :spritesheet="currentDefender.sprite" pose="standing"></Sprite>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tilemap {
  position: relative;

  margin-top: 50vh;

  /* transform: rotate(45deg) scaleX(2) scaleY(.75); */
  transform: scaleX(2) scaleY(.5) rotate(45deg);
}
.turn {
  border-width: 2px;
  border-color: rgba(0, 0, 0, 0);
  border-style: solid;
}
.current-turn {
  border-color: blueviolet;
}

.player-view {
  background:linear-gradient(aquamarine 0%, rgba(255, 255, 255, 0) 50%);
  color: black;
}
.enemy-view {
  background:linear-gradient(orangered 0%, rgba(255, 255, 255, 0) 50%);
  /* color: black; */
}

.attack-view-container {
  display: flex;
  flex-direction: row;
  width: 30vw;
}
.attack-view-container>div {
  flex-grow: 1;
}
.attack-view-sprite-container {
    transform: scale(500%);
    display: flex;
    justify-content: center;
    margin-top: 50px;
    pointer-events: none;
}
button {
  z-index: 50;
}


.attack-info {
  opacity: 0;
}
.show-attack-info {
  opacity: 1;
}

.defend-button,
.attack-button {
  opacity: 0;
}
.enemy-view .attack-button {
  opacity: 0;
}
.player-view .attack-button {
  opacity: 1;
}
</style>
