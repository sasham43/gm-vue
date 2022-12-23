<script>
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
    sprite: String,
    spritePose: {
      type: String,
      default: "standing",
    },
    heightMap: Array,
  },
  data() {
    return {
      tileWidth: 50,
      tileHeight: 50,
      tileBorderBase: 2,
      tileMarginBase: 4,
      isTakingDamage: false,
      isHealing: false,
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
      if(this.health <= 0){
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
    }
  },
  watch: {
    health(newValue, oldValue){
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
    }
  },
  components: {
    Sprite,
  },
};
</script>
<template>
  <div
    :style="{ top: top, left: left }"
    :class="{ enemy: this.isEnemy, dead: health <= 0, 'damage': isTakingDamage, 'healing': isHealing }"
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
  </div>
    <Sprite :spritesheet="sprite" :pose="pose"></Sprite>
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
  transform: scaleX(3) scaleY(3) rotate(-45deg) translateY(-20px) scaleX(.5) scaleY(2)
}

.damage {
  /* filter: hue-rotate(49deg) saturate(2); */
  filter: sepia() saturate(10000%) hue-rotate(40deg)
}
.healing {
  /* filter: hue-rotate(49deg) saturate(2); */
  filter: sepia() saturate(10000%) hue-rotate(140deg)
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
