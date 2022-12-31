<script>
import TileMap from "./TileMap.vue";
import Actor from "./Actor.vue";
import Sprite from "./Sprite.vue";
import {
  isHighlightedAttack,
  findDistance,
  isHighlightedMove,
} from "../utils/highlight";
import { pathfinding, highlightMovementTiles } from '../utils/movement'
import rollDice, {findModifier} from "../utils/dice";
import allomancy from '../utils/powers'

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
        speed: 2,
        // meleePower: 2,
        points: {
          hp: {
            current: 10,
            max: 10
          },
          mp: {
            current: 5,
            max: 5,
          }
        },
        // health: 10,
        // healthMax: 10,
        // rangedPower: 1,
        range: 2,
        initiative: 0,
        sprite: "src/assets/hero-1.png",
        stats: {
          str: 16,
          dex: 16,
          con: 14,
          wis: 14,
          int: 12,
          cha: 10,
        },
        ac: 15,
        items: [
          {
            name: 'health potion',
            effect: 'heal',
            amount: '1d4',
            target: 'self',
          }
        ],
        // allomancy: [
        //   {
        //     metal: 'steel'
        //   }
        // ],
        allomancy,
        availablePowers: [],
        burningMetals: [],
        attacks: [
          {
            type: 'melee',
            name: 'sword',
            stat: 'str',
            damage: '1d8'
          },
          {
            type: 'ranged',
            name: 'dart',
            stat: 'dex',
            damage: '1d4',
            range: 2,
          }
        ]
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
          points: {
            hp: {
              current: 4,
              max: 4
            },
          },
          // health: 4,
          // healthMax: 4,
          initiative: 0,
          sprite: "src/assets/enemy-1.png",
          stats: {
            str: 12,
            dex: 12,
            con: 12,
            wis: 12,
            int: 12,
            cha: 12,
          },
          ac: 12,
          attacks: [
            {
              type: 'melee',
              name: 'axe',
              damage: '1d6'
            }
          ]
        },
        {
          enemy: true,
          name: "Globnord",
          x: 4,
          y: 0,
          speed: 1,
          // attack: "ranged",
          // health: 4,
          // healthMax: 4,
          points: {
            hp: {
              current: 4,
              max: 4
            },
          },
          initiative: 0,
          // range: 2,
          // rangedPower: 2,
          sprite: "src/assets/enemy-2.png",
          stats: {
            str: 12,
            dex: 12,
            con: 12,
            wis: 12,
            int: 12,
            cha: 12,
          },
          ac: 12,
          attacks: [
            {
              type: 'ranged',
              name: 'bow & arrow',
              damage: '1d6',
              range: 2,
            }
          ]
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
      showMetals: false,
      endResult: '',
      isMouseDown: false,
      mapPan: {
        x: 0,
        y: 0,
      },
      mouseDownPoint: {
        x: 0,
        y: 0,
      },
      // showAbilities: false,
      showButtons: '',
      highlightedMoveTiles: [],
      // viewMode: 'top-down',
      viewMode: 'isometric',
      burnRate: 3,
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
    showResetMapPanButton(){
      let x = this.mapPan.x//.replace('px', '')
      let y = this.mapPan.y//.replace('px', '')

      if(x != 0 && y != 0){
        return true;
      } else {
        return false;
      }
    },
    showAbilities(){
      return this.showButtons == 'abilities'
    },
    showItems(){
      return this.showButtons == 'items'
    },
  },
  methods: {
    nextTurn() {

      this.currentActorAttacked = false;
      this.currentActorMoved = false;

      // console.log('nextTurn turnOrder', this.turnOrder.length)

      // console.log('nextTurn',this.currentTurn, this.turnOrder.length - 1)

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
          this.performAttack(this.player, this.currentDefender)
          // this.currentDefender.health -= this.player.attackPower;
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
        }
      } else if (this.mode == "ranged") {
        let isAttackable = isHighlightedAttack(
          "ranged",
          col,
          row,
          this.playerX,
          this.playerY,
          this.player.selectedAttack.range
        );

        let enemy = this.findEnemyPos(selectPos);

        if (isAttackable && enemy) {
          this.currentDefender = enemy;
          // this.player.attackPower = this.player.rangedPower;
          this.displayAttackView();


          console.log('attack', enemy)
        } else {
          console.log('no attack ranged', isAttackable, enemy)
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
      // console.log('watch current turn', newValue)
      console.log('currentAcot', this.turnOrder, newValue, currentActor)

      this.currentActor = currentActor;
      this.currentDefender = {}

      if (currentActor.player) {

        // wait for player input
        console.log("player turn");
        this.mode = 'player-turn'
      } else {
        // AI actions
        console.log("enemy turn");
        currentActor.distanceFromStart = 0;
        this.enemyTurn(currentActor);
      }
      this.highlightedMoveTiles = highlightMovementTiles(this.tiles, currentActor, currentActor.speed)
      // console.log('we can move onto these', this.highlightedMoveTiles)

      // update current actor turn values
      // if(this.currentActor.burningMetals?.length){
      //   this.currentActor.burningMetals = this.currentActor.burningMetals.map(metal => {
      //     metal.currentBurn++;
      //     return metal;
      //   })
      //   this.currentActor.burningMetals = this.currentActor.burningMetals.filter(metal => {
      //     return metal.currentBurn < metal.burnRate;
      //   })
      //   console.log('metals:', this.currentActor.burningMetals)
      //   // update this later
      //   if(this.currentActor.burningMetals.length == 0){
      //     this.currentActor.availablePowers = []
      //   }
      // }


    },
    enemyTurn(actor) {
      // console.log('jjjj', this.showEndScreen)
      if(this.showEndScreen) return;
      this.currentDefender = this.player;
      let attack = actor.attacks[0]
      actor.selectedAttack = attack;
      // check if can attack player
      if (attack.type == "ranged") {
        let isAttackable = isHighlightedAttack(
          "ranged",
          this.player.x,
          this.player.y,
          actor.x,
          actor.y,
          attack.range
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
            this.mode = actor.selectedAttack.type;
            this.enemyChoice(() => {
              this.performAttack(actor, this.player);
              this.currentActorAttacked = true;
              this.enemyTurn(actor);
            });
          }
        }
      } else if (attack.type == "melee") {
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
          // console.log('should enemy melee attack?')
          // attack
          if (this.currentActorAttacked) {
            // this.nextTurn();
            this.currentActorMoved = true;
          } else {
            // console.log("melee attack");
            this.mode = actor.selectedAttack.type;
            this.enemyChoice(() => {
              this.performAttack(actor, this.player);
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
    performAttack(attacker, defender){
      let attack = attacker.selectedAttack;
      let stat = attacker.stats[attack.stat]

      let modifier = findModifier(stat)
      let attackRoll = rollDice('1d20', modifier)
      if(attackRoll.total >= defender.ac){
        let damage = rollDice(attack.damage, modifier)
        // console.log('hit!', damage)

        // defender.health -= damage.total;
        defender.points.hp.current -= damage.total;
      } else {
        // console.log('miss')
        defender.effect = 'miss'
      }
      // console.log('performing attack', stat, modifier, attackRoll)
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
        // console.log('current actor finished, next turn')
        this.nextTurn();
      }
    },
    displayAttackView(){
      // here
      this.showAttackInfo = true;
    },
    filterDead(){
      // console.log('filtering dead')
      this.turnOrder = this.turnOrder.filter(actor => {
        // console.log('actor health', actor.health)
        return actor.points.hp.current > 0;
      })
      if(this.currentTurn >= this.turnOrder.length){
        this.currentTurn = 0;
      }
      // console.log('filtered dead', JSON.stringify(this.turnOrder))

      let livingPlayers = this.turnOrder.filter(actor => {
        return actor.player
      })
      let livingEnemies = this.turnOrder.filter(actor => {
        return actor.enemy
      })

      // console.log('living', livingEnemies.length, livingPlayers.length)

      if(livingEnemies.length == 0){
        this.endBattle('victory')
      } else if (livingPlayers.length == 0){
        this.endBattle('defeat')
      }
    },
    endBattle(result){
      this.endResult = result;
      window.setTimeout(() => {
        this.showEndScreen = true;
      }, 2000);
    },
    hideEndScreen(){
      this.showEndScreen = false;
      this.endResult = '';
      this.turnOrder = []
    },
    onMouseDown(event){
      // console.log('on mouse down', document.body.classList)
      this.isMouseDown = true;

      // capture mouse position
      this.mouseDownPoint = {
          x: `${event.pageX}`,
          y: `${event.pageY}`
        }

      // document.body.addClass('grabbing')
      document.body.classList = ['grabbing']
    },
    onMouseUp(event){
      // console.log('on mouse Up')
      this.isMouseDown = false;
      // document.body.removeClass('grabbing')

      document.body.classList = []
    },
    onMouseMove(event){
      if(this.isMouseDown){
        // fix this, gets weird if you pan to the right
        let x, y;
        let modifier = ''
        if(this.mouseDownPoint.x > event.pageX){
          x = this.mouseDownPoint.x - event.pageX
          modifier = '-'
        } else {
          x = event.pageX - this.mouseDownPoint.x
          // modifier = ''
        }
        if(this.mouseDownPoint.y > event.pageY){
          y = this.mouseDownPoint.y - event.pageY
          modifier = '-'
        } else {
          y = event.pageY - this.mouseDownPoint.y
          // modifier = ''
        }

        this.mapPan = {
          x: `${modifier}${x}px`,
          y: `${modifier}${y}px`
        }
      }
    },
    resetMapPosition(){
      this.mapPan = {
        x: '0',
        y: '0'
      }
    },
    displayAbilities(){
      // this.showAbilities = true;
      this.showButtons = 'abilities'
    },
    hideAbilities(){
      // this.showAbilities = false;
      this.showButtons = ''
    },
    displayItems(){
      // this.showItems = true;
      this.showButtons = 'items'
    },
    hideItems(){
      // this.showAbilities = false;
      this.showButtons = ''
    },
    selectAttack(attack){
      console.log('attack', attack)
      this.player.selectedAttack = attack;
      this.mode = attack.type;
    },
    selectItem(item){
      this.player.selectedItem = item;
      this.mode = item.effect;
      if(item.target == 'self'){
        this.currentDefender = this.player
      }
    },
    playerItem(item){
      if(item.effect == 'heal'){
        let amount = rollDice(item.amount).total;

        if(this.player.points.hp.current + amount > this.player.points.hp.max){
          this.player.points.hp.current = this.player.points.hp.max;
        } else {
          this.player.points.hp.current += amount;
        }

        this.currentActorAttacked = true;
      }
    },
    setViewMode(mode){
      console.log('mode', mode)
      this.viewMode = mode;
    },
    burnMetal(power, metal){
      // console.log('we got it', power, allomancy[metal], allomancy)
      this.player.availablePowers = allomancy[metal].abilities

      // instantiate
      power.details.currentBurn = 0;
      this.player.points.mp.current--;
      this.player.burningMetals.push(power.details)
    },
    displayMetals(){
      this.showMetals = true;
    },
    hideMetals(){
      this.showMetals = false;
    },
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
  mounted(){
    // console.log('game create')

    document.body.addEventListener('mousedown', this.onMouseDown)
    document.body.addEventListener('mouseup', this.onMouseUp)
    document.body.addEventListener('mousemove', this.onMouseMove)
  }
};
</script>

<template>

  <button v-if="showResetMapPanButton" @click="resetMapPosition" class="reset-map-position">
    Reset Map
  </button>

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
      <div v-if="showMetals" class="metals abilities">
        <!-- <button @click="burnMetal(power, key)" v-for="(power, key) in player.allomancy">
          {{ key }} - {{ power.details.currentBurn }}
        </button> -->
        <MetalButton :label="key" :burnRate="power.details.burnRate" :currentBurn="power.details.currentBurn" @click="burnMetal(power, key)" v-for="(power, key) in player.allomancy"></MetalButton>
      </div>
      <div v-if="showAbilities" class="abilities">
        <button @click="selectAttack(attack)" v-for="attack in player.attacks">
          {{ attack.name }} - {{ attack.type }}
        </button>
        <button @click="selectAttack(power)" v-for="power in player.availablePowers">
          {{ power.name }}
        </button>
      </div>
      <div v-if="showItems" class="abilities">
        <button @click="selectItem(item)" v-for="item in player.items">
          {{ item.name }} - {{ item.effect }}
        </button>
      </div>
      <button @click="displayAbilities()" :disabled="currentActor.player && currentActorAttacked">
        abilities
      </button>
      <button @click="displayMetals()" :disabled="!currentActor.player">
        metals
      </button>
      <button @click="displayItems()" :disabled="currentActor.player && currentActorAttacked">
        items
      </button>
      <!-- <button @click="setMode('melee')" :disabled="currentActor.player && currentActorAttacked">melee</button>
        <button @click="setMode('ranged')" :disabled="currentActor.player && currentActorAttacked">ranged</button> -->
        <button @click="setMode('player-move')" :disabled="currentActor.player && currentActorMoved">player move</button>
        <!-- {{ mode }} -->
    </div>

    <div class="settings-container">
      <button @click="setViewMode('top-down')" v-if="viewMode === 'isometric'">
        Top Down
      </button>
      <button @click="setViewMode('isometric')" v-if="viewMode === 'top-down'">
        Isometric
      </button>
    </div>

    <div class="tilemap" :style="{top: mapPan.y, left: mapPan.x}" :class="{'grabbing': isMouseDown, 'isometric': viewMode === 'isometric', 'top-down': viewMode === 'top-down'}">
      <TileMap
        @tile-select="onTileSelect"
        :player="player"
        :currentActor="currentActor"
        :tiles="tiles"
        :mode="mode"
        :heightMap="heightMap" 
        :highlightedMoveTiles="highlightedMoveTiles"
        :viewMode="viewMode"
      ></TileMap>
      <Actor v-bind="player" :currentTurn="currentTurn" :currentActor="currentActor" :tiles="tiles" :heightMap="heightMap" :viewMode="viewMode"></Actor>
      <Actor v-for="enemy in enemies" :currentTurn="currentTurn" :currentActor="currentActor" :isEnemy="true" v-bind="enemy" :heightMap="heightMap" :viewMode="viewMode"></Actor>
    </div>
  </div>


  <div class="attack-view-container">
    <div class="attacker" :class="{'player-view': currentActor.player, 'enemy-view': currentActor.enemy, 'visible-attacker': currentActor.name}">

      <div class="attack-view-upper">
        <div class="attack-view-sprite-container">
          <Sprite :spritesheet="currentActor.sprite" pose="standing"></Sprite>
        </div>
  
        <div v-if="currentActor.selectedAttack && !currentActorAttacked" class="attack-info-container" :class="{'show-attack-info': showAttackInfo}">
          <div class="attack-info">
            {{ currentActor.selectedAttack.name }} - {{ currentActor.selectedAttack.type }}
          </div>
          <div class="attack-info">
            <button class="attack-button" @click="playerAttack()">
              Attack
            </button>
          </div>
        </div>
        <div v-if="currentActor.selectedItem && !currentActorAttacked" class="attack-info-container" :class="{'show-attack-info': showAttackInfo}">
          <div class="attack-info">
            {{ currentActor.selectedItem.name }} - {{ currentActor.selectedItem.effect }}
          </div>
          <div class="attack-info">
            <button class="attack-button" @click="playerItem(currentActor.selectedItem)">
              Use
            </button>
          </div>
        </div>
      </div>

      <div class="attacker-info-container">
        <div>
          {{ currentActor.name }}
        </div>
        <div class="hp" :style="{ 'background': `linear-gradient(to right, red ${(currentActor.points?.hp.current / currentActor.points?.hp.max) * 100}%, white .1%)`}">
          HP: {{ currentActor.points?.hp.current }} / {{ currentActor.points?.hp.max }}
        </div>
        <div class="hp" v-if="currentActor.points?.mp" :style="{ 'background': `linear-gradient(to right, blue ${(currentActor.points?.mp.current / currentActor.points?.mp.max) * 100}%, white .1%)`}">
          MP: {{ currentActor.points?.mp.current }} / {{ currentActor.points?.mp.max }}
        </div>
      </div>
    </div>
    <div class="defender" :class="{'player-view': currentDefender.player, 'enemy-view': currentDefender.enemy, 'visible-defender': currentDefender.name}">
      <div class="defend-view-upper">
        <div class="defend-view-sprite-container">
          <Sprite :spritesheet="currentDefender.sprite" pose="standing"></Sprite>
        </div>
      </div>

      <div class="defender-info-container">
        <div>
          {{ currentDefender.name }}
        </div>
        <div class="hp"
          :style="{ 'background': `linear-gradient(to right, red ${(currentDefender.points?.hp.current / currentDefender.points?.hp.max) * 100}%, white .1%)`}">
          HP: {{ currentDefender.points?.hp.current }} / {{ currentDefender.points?.hp.max }}
        </div>
        <div class="hp" v-if="currentDefender.points?.mp"
          :style="{ 'background': `linear-gradient(to right, blue ${(currentDefender.points?.mp.current / currentDefender.points?.mp.max) * 100}%, white .1%)`}">
          MP: {{ currentDefender.points?.mp.current }} / {{ currentDefender.points?.mp.max }}
        </div>
        <div>
          AC: {{ currentDefender.ac }}
        </div>
      </div>

      <!-- <div>
        <button class="defend-button">
          Defend
        </button>
      </div> -->
    </div>
    
  </div>


  <div @click="hideEndScreen()" v-if="showEndScreen" class="end-screen" :style="{'border-color': endResult == 'victory' ? 'turquoise' : 'gold'}">
    <div v-if="endResult == 'victory'" class="victory">
      Victory!
    </div>
    <div v-else-if="endResult == 'defeat'" class="defeat">
      Defeat...
    </div>
  </div>
</template>

<style scoped>
.tilemap {
  position: relative;

  margin-top: 20vh;

  /* transform: rotate(45deg) scaleX(2) scaleY(.75); */
  /* transform: scaleX(2) scaleY(.5) rotate(45deg); */
}
.tilemap.isometric {
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
.settings-container {
  position: absolute;
  top: 0px;
  right: 0px;
}

.hp {
  /* background-color: red; */
  /* background: linear-gradient(to right, red 80%, white 10%); */
  /* margin-right: 100px;
  margin-left: 100px; */
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

.attacker,
.defender {
  transition: 0.2s transform;
}

.attacker {
  transform: translateX(-50vw);
}
.visible-attacker {
  transform: translateX(0px);
}
.defender {
  transform: translateX(50vw);
}
.visible-defender {
  transform: translateX(0px);
}


.defender-info-container,
.attacker-info-container {
  padding: 0px 100px;
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

.reset-map-position {
  position: absolute;
  top: 5px;
  right: 5px;
}

.abilities {
  position: absolute;
  top: 30px;
}

@media(max-width: 400px){
  .defend-view-sprite-container {
    transform: scale(400%);
    margin-top: 25px;
    margin-right: 25px;
  }
  .attack-view-sprite-container {
    transform: scale(400%);
    margin-top: 25px;
    margin-left: 25px;
  }
}
</style>
