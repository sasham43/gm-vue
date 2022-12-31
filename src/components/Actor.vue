<script>
import _ from 'lodash'
import Sprite from "./Sprite.vue";
export default {
  props: {
    type: String,
    position: String,
    tiles: Array,
    speed: Number,
    x: Number,
    y: Number,
    isEnemy: Boolean,
    health: Number,
    points: Object,
    sprite: String,
    spritePose: {
      type: String,
      default: "standing",
    },
    heightMap: Array,
    effect: String,
    viewMode: String,
    currentTurn: Number,
    currentActor: Object,
    name: String,
    burningMetals: Array
  },
  data() {
    return {
      tileWidth: 50,
      tileHeight: 50,
      tileBorderBase: 2,
      tileMarginBase: 4,
      isTakingDamage: false,
      isHealing: false,
      actorEffect: '',
      // isBurningMetal: true,
      isBurningMetal: false,
      burnInterval: null,
    };
  },
  computed: {
    xPos() {
      if (this.position) {
        return this.position?.split(",")[0];
      } else {
        return this.x;
      }
    },
    yPos() {
      if (this.position) {
        return this.position?.split(",")[1];
      } else {
        return this.y;
      }
    },
    currentTile() {
      return this.tiles[this.xPos][this.yPos];
    },
    tileBorder() {
      return this.tileBorderBase * 2;
    },
    tileMargin() {
      return this.tileMarginBase * 2;
    },
    left() {
      return `${
        ((this.tileWidth + this.tileMargin + this.tileBorder) * this.xPos) - (this.currentHeight * 50)
      }px`;
    },
    top() {
      return `${
        ((this.tileHeight + this.tileMargin + this.tileBorder) * this.yPos) - (this.currentHeight * 50)
      }px`;
    },
    pose(){
      if(this.points.hp.current <= 0){
        return 'standing'
      } else {
        return this.spritePose;
      }
    },
    currentHeight(){
      return this.heightMap[this.y][this.x]
    },
    heightTransform(){
      return `translate(-${this.currentHeight * 50}px, -${this.currentHeight * 50}px)`
    },
    isActiveTurn(){
      return this.currentActor.name === this.name
    }
    // isBurningMetal(){
    //   return this.burningMetals?.length > 0;
    // }
  },
  watch: {
    'points.hp.current'(newValue, oldValue){
      if(newValue < oldValue){
        let damageDuration = 400;
        this.damageTaken = oldValue - newValue;
        this.isTakingDamage = true;

        window.setTimeout(() => {
          this.isTakingDamage = false;
          this.damageTaken = 0;
        }, damageDuration)
        // Add damage shake
        // add healing
        // add little pop up that shows the damage
        // change the transition to have damage effect be faster
      } else if (newValue > oldValue){
        let healDuration = 1000;
        this.healAmount = newValue - oldValue
        this.isHealing = true;

        window.setTimeout(() => {
          this.isHealing = false;
          this.healAmount = 0;
        }, healDuration)
      }
    },
    effect(newValue, oldValue){
      this.actorEffect = newValue
      window.setTimeout(() => {
        this.actorEffect = '';
      }, 1000)
    },
    currentTurn(newValue, oldValue){
      // console.log('turn changed', this.name, this.currentActor.name === this.name)
      if(this.isActiveTurn){
        // update metal values
        this.burningMetals?.forEach(metal => {
          if(metal.currentBurn === metal.burnRate){
            metal.currentBurn = 0;
          } else {
            metal.currentBurn++;
          }
        })
      }
    },
    'burningMetals.length'(newValue, oldValue){
      // console.log('watching', newValue, oldValue)
      if(newValue > oldValue && newValue > 0){
        // console.log('setting interfval')
        this.burnInterval = window.setInterval(() => {
          // console.log('switching')
          this.isBurningMetal = !this.isBurningMetal;
        }, 1000)
      } else {
        window.clearInterval(this.burnInterval)
        this.isBurningMetal = false;
      }
    },
    // currentTurn(newValue, oldValue){
    //   console.log('next turn', newValue)
    // }
  },
  components: {
    Sprite,
  },
  created(){
    // window.setTimeout(() => {
    //   this.isTakingDamage = true
    //   this.damageTaken = 10;
    // },2000)
    // window.setInterval(() => {
    //   this.isBurningMetal = !this.isBurningMetal;
    // }, 1000)
  }
};
</script>
<template>
  <div
    :style="{ top: top, left: left }"
    :class="{ enemy: this.isEnemy, dead: points?.hp.current <= 0, 'damage': isTakingDamage, 'healing': isHealing, 'isometric': viewMode === 'isometric' }"
    class="actor"
  >
    <div class="health-change" :class="{'damage-info': isTakingDamage, 'healing-info': isHealing}">
      <span v-if="isTakingDamage">
        -{{ damageTaken }}
        <!-- -4 -->
      </span>
      <span v-if="isHealing">
        +{{ healAmount }}
      </span>
      <span v-if="actorEffect">
        {{ actorEffect }}
      </span>
    </div>
    <div class="sprite-wrapper" :class="{'damage-shake': isTakingDamage}">
      <Sprite :spritesheet="sprite" :pose="pose"></Sprite>
      <Sprite class="blur-sprite" :class="{'blur-sprite-show': isBurningMetal}" :spritesheet="sprite" :pose="pose"></Sprite>
    </div>
    <!-- <span>{{ currentHeight }}</span> -->
  </div>
</template>

<style scoped>
.actor {
  width: 24px;
  height: 24px;
  margin: 18px;
  border: solid 1px rgba(0, 0, 0, 0);
  /* border: solid 1px aquamarine;
  background-color: darkturquoise; */

  position: absolute;
  pointer-events: none;
  transition: 1s top, 1s left, .4s filter;
  transform: scale(1.5);

  /* isometric */
  /* transform: scaleX(2) scaleY(2) rotate(-45deg) translateY(-10px); */
  /* transform: scaleX(3) scaleY(3) rotate(-45deg) translateY(-20px) scaleX(.5) scaleY(2); */
}
.actor.isometric {
  transform: scaleX(3) scaleY(3) rotate(-45deg) translateY(-20px) scaleX(.5) scaleY(2);
}

.blur-sprite {
  /* filter: blur(4px); */
  opacity: 0;
  position: absolute;
  top: 0;
  z-index: 8;
  filter: sepia() saturate(10000%) hue-rotate(240deg) blur(10px);
  transform: scaleX(4.4);
  transition: 1s opacity ease-in-out;
}
.blur-sprite-show {
  opacity: 1;
}

.sprite-wrapper {
  /* transition: 0.1s translate ease; */
  animation-duration: .3s;
  animation-timing-function: linear;
}
.damage-shake {
  /* transform: translateX(5px); */
  animation-name: shake;
}

@keyframes shake {
  0% {
    transform: translateX(5px);
  }

  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }

  100% {
    transform: translateX(0px);
  }
}

.damage {
  /* filter: hue-rotate(49deg) saturate(2); */
  filter: sepia() saturate(10000%) hue-rotate(40deg)
}
.healing {
  /* filter: hue-rotate(49deg) saturate(2); */
  filter: sepia() saturate(10000%) hue-rotate(240deg)
}

.damage.sprite-container {
  transform: translate(100px)
}

.enemy {
  /* border: solid 1px red;
  background-color: brown; */
}

.health-change {
  font-size: 6px;
  position: absolute;
  top: -10px;
  left: 6px
}

.health-change.damage-info {
  color: orangered;
}
.health-change.healing-info {
  color: darkturquoise;
}
.dead {
  /* background-color: black; */
  filter: grayscale(100%);
}
</style>
