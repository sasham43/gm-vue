<script>
import TileMap from "./TileMap.vue";
import Actor from "./Actor.vue";
import Sprite from "./Sprite.vue";
import {
  isHighlightedAttack,
  findDistance,
  isHighlightedMove,
} from "../utils/highlight";
import {pathfinding} from '../utils/movement'
import rollDice from "../utils/dice";

import _ from "lodash";

export default {
  data() {
    return {
      currentTurn: 0,
      heightMap: [
        [2, 1, 1, 0, 0],
        [1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      // heightMap: [
      //   [4, 4, 3, 3, 2],
      //   [3, 1, 0, 2, 2],
      //   [2, 1, 0, 1, 0],
      //   [1, 0, 0, 0, 0],
      //   [0, 0, 0, 0, 0],
      // ],
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
      showEndScreen: false,
      endResult: '',
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

      console.log('nextTurn',this.currentTurn, this.turnOrder.length - 1)

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
      let result = pathfinding(this.tiles, this.player, { x, y });

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

      // if (currentActor.health <= 0) {
      //   console.log('current actor health 0', currentActor)
      //   this.nextTurn();
      // }
      console.log('watch current turn', newValue)

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
      if(this.showEndScreen) return;
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
            // this.nextTurn();
            this.currentActorAttacked = true; // attack is impossible
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
            // this.nextTurn();
            this.currentActorMoved = true;
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
        console.log("is attackable", isAttackable);
        if (!isAttackable) {
          // console.log("too far, moving");
          if (this.currentActorMoved) {
            // this.nextTurn();
            this.currentActorAttacked = true; // attack is impossible
          } else {
            this.setMode('enemy-move')
            this.enemyChoice(() => {
              this.moveTowardsPlayer(actor);
              this.currentActorMoved = true;
              this.enemyTurn(actor);
            });
          }
        } else {
          console.log('should enemy melee attack?')
          // attack
          if (this.currentActorAttacked) {
            // this.nextTurn();
            this.currentActorMoved = true;
          } else {
            console.log("melee attack");
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
      }, 300); // .8s
    },
    moveTowardsPlayer(actor) {
      let result = pathfinding(this.tiles, actor, this.player);
      // console.log("path lenght", result.length);
      // remove last piece of route because we don't want to move ontop of player
      result.pop();

      // console.log("result", result, actor);

      this.moveAlongPath(actor, result, actor.speed);
    },
    watchCurrentActorActions() {
      if (this.currentActorAttacked && this.currentActorMoved) {
        console.log('current actor finished, next turn')
        this.nextTurn();
      }
    },
    displayAttackView(){
      // here
      this.showAttackInfo = true;
    },
    filterDead(){
      console.log('filtering dead')
      this.turnOrder = this.turnOrder.filter(actor => {
        return actor.health > 0;
      })

      let livingPlayers = this.turnOrder.filter(actor => {
        return actor.player
      })
      let livingEnemies = this.turnOrder.filter(actor => {
        return actor.enemy
      })

      if(livingEnemies.length == 0){
        this.endBattle('victory')
      } else if (livingPlayers.length == 0){
        this.endBattle('defeat')
      }
    },
    endBattle(result){
      this.showEndScreen = true;
      this.endResult = result;
      // if(this.turnOrder[0].player){
      //   this.endResult = 'victory'
      // } else {
      //   this.endResult = 'defeat'
      // }
    },
    hideEndScreen(){
      this.showEndScreen = false;
      this.endResult = '';
    }
  },
  watch: {
    currentTurn(newValue, oldValue) {
      return this.watchCurrentTurn(newValue, oldValue);
    },
    currentActorAttacked() {
      this.filterDead()
      this.watchCurrentActorActions();
    },
    currentActorMoved() {
      this.filterDead()
      this.watchCurrentActorActions();
    }
  },
  components: { TileMap, Actor, Sprite },
};
</script>

<template>

  <div class="battle-turn-container">
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
      <button @click="setMode('player-move')" :disabled="currentActor.player && currentActorMoved">player move</button>
    </div>
    <div class="tilemap">
      <TileMap
        @tile-select="onTileSelect"
        :player="player"
        :currentActor="currentActor"
        :tiles="tiles"
        :mode="mode"
        :heightMap="heightMap" 
      ></TileMap>
      <Actor v-bind="player" :tiles="tiles" :heightMap="heightMap"></Actor>
      <Actor v-for="enemy in enemies" :isEnemy="true" v-bind="enemy" :heightMap="heightMap"></Actor>
    </div>
  </div>
  <div class="attack-view-container">
    <div class="attacker" :class="{'player-view': currentActor.player, 'enemy-view': currentActor.enemy}">

      <div class="attack-view-upper">
        <div class="attack-view-sprite-container">
          <Sprite :spritesheet="currentActor.sprite" pose="standing"></Sprite>
        </div>
  
        <div class="attack-info-container" :class="{'show-attack-info': showAttackInfo}">
          <div class="attack-info">
            Power: {{ currentActor.attackPower }}
          </div>
          <div class="attack-info">
            <button class="attack-button" @click="playerAttack()">
              Attack
            </button>
          </div>
        </div>
      </div>

      <div class="attacker-info-container">
        <div>
          {{ currentActor.name }}
        </div>
        <div>
          HP: {{ currentActor.health }} / {{ currentActor.healthMax }}
        </div>
      </div>
    </div>
    <div class="defender" :class="{'player-view': currentDefender.player, 'enemy-view': currentDefender.enemy}">
      <div class="defend-view-upper">
        <div class="defend-view-sprite-container">
          <Sprite :spritesheet="currentDefender.sprite" pose="standing"></Sprite>
        </div>
      </div>

      <div class="defender-info-container">
        <div>
          Defender: {{ currentDefender.name }}
        </div>
        <div>
          HP: {{ currentDefender.health }} / {{ currentDefender.healthMax }}
        </div>
      </div>

      <!-- <div>
        <button class="defend-button">
          Defend
        </button>
      </div> -->
    </div>

    <div @click="hideEndScreen()" v-if="showEndScreen" class="end-screen" :style="{'border-color': endResult == 'victory' ? 'turquoise' : 'gold'}">
      <div v-if="endResult == 'victory'" class="victory">
        Victory!
      </div>
      <div v-else-if="endResult == 'defeat'" class="defeat">
        Defeat...
      </div>
    </div>
  </div>
</template>

<style scoped>
.tilemap {
  position: relative;

  margin-top: 20vh;

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

.attacker.player-view {
  background:linear-gradient(to right, aquamarine 0%, rgba(255, 255, 255, 0) 90%);
  color: black;
  padding-bottom: 20px;
}
.defender.player-view {
  background:linear-gradient(to left, aquamarine 0%, rgba(255, 255, 255, 0) 90%);
  color: black;
  padding-bottom: 20px;
}
.defender.enemy-view {
  background:linear-gradient(to left, orangered 0%, rgba(255, 255, 255, 0) 90%);
  /* color: black; */
}
.attacker.enemy-view {
  background:linear-gradient(to right, orangered 0%, rgba(255, 255, 255, 0) 90%);
  /* color: black; */
}

.attack-view-container {
  display: flex;
  flex-direction: row;
  /* width: 30vw; */

  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
}
.attack-view-container>div {
  flex-grow: 1;
  width: 50%;
}
.attack-view-sprite-container {
    transform: scale(500%);
    display: flex;
    justify-content: center;
    margin-top: 50px;
    margin-left: 50px;
    pointer-events: none;
    width: 25px;
    height: 25px;      
}
.defend-view-sprite-container {
    transform: scale(500%);
    display: flex;
    justify-content: center;
    margin-top: 50px;
    margin-right: 50px;
    pointer-events: none;
    width: 25px;
    height: 25px;      
}
.defend-view-upper {
  display: flex;
  justify-content: flex-end;
}
.attack-view-upper {
  display: flex;
  flex-direction: row;
}
button {
  z-index: 50;
}
.attack-info-container {
  width: 100%;
  margin-top: 5px;
}

/* .attack-info {
  opacity: 0;
} */
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

.battle-turn-container {
  position: absolute;
  left: 5px;
  top: 5px;
}

.end-screen {
  /* width: 75vw;
  height: 75vw; */
  position: absolute;
  inset: 25vw 25vh;
  background-color: black;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  font-size: 42px;
  font-weight: 700;
  border-style: solid;
  border-width: 5px;
  cursor: pointer;
  /* border: solid 5px turquoise; */
}

.victory,
.defeat {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.victory {
  background-color: aquamarine;
  color: black;
}

.defeat {
  background-color: orangered;
  border: gold;

}

@media(max-width: 400px){
  .attack-view-sprite-container {
    transform: scale(400%);
    margin-top: 25px;
    margin-left: 25px;
  }
}
</style>
