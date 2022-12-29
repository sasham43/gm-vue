<script>
export default {
  props: {
    spritesheet: String,
    pose: String,
  },
  data() {
    return {
      //   top: "-48px",
      //   left: "right",
      //   top: "0px",
      //   left: "0px",
      poses: [
        {
          pose: "standing",
          top: "0px",
          left: "-24px",
        },
        {
          pose: "s-walk-1",
          position: "top left",
          top: "0px",
          left: "0px",
        },
        {
          pose: "s-walk-2",
          position: "top center",
          top: "0px",
          left: "-24px",
        },
        {
          pose: "s-walk-3",
          position: "top right",
          top: "0px",
          left: "-48px",
        },
        {
          pose: "w-walk-1",

          top: "-24px",
          left: "0px",
        },
        {
          pose: "w-walk-2",

          top: "-24px",
          left: "-24px",
        },
        {
          pose: "w-walk-3",

          top: "-24px",
          left: "-48px",
        },
        // E WALK
        {
          pose: "e-walk-1",
          //   position: "-48px 0px",
          top: "-48px",
          left: "0px",
        },
        {
          pose: "e-walk-2",
          //   position: "-48px 24px",
          top: "-48px",
          left: "-24px",
        },
        {
          pose: "e-walk-3",
          //   position: "-48px 48px",
          top: "-48px",
          left: "-48px",
        },
        //
        {
          pose: "n-walk-1",

          top: "-74px",
          left: "0px",
        },
        {
          pose: "n-walk-2",

          top: "-74px",
          left: "-24px",
        },
        {
          pose: "n-walk-3",

          top: "-74px",
          left: "-48px",
        },
      ],
      animPoses: [
        {
          pose: "standing",
          top: "0px",
          left: "-24px",
        },
      ],
      animStep: 0,
      animSpeed: 250,
      animating: null,
      animPosition: "",
    };
  },
  methods: {
    animate() {
      //   console.log("animate()", this.animPoses);
      let reverse = false;
      this.animating = window.setInterval(() => {
        if (reverse) {
          this.animStep--;
        } else {
          this.animStep++;
        }
        if (this.animStep == this.animPoses.length) {
          reverse = true;
          this.animStep -= 2;
          //   this.animStep = 0;
        } else if (this.animStep == 0 && reverse == true) {
          reverse = false;
        }
        this.animPosition = this.animPoses[this.animStep].position;
      }, this.animSpeed);
    },
    stopAnimating() {
      this.animStep = 0;
      this.animPoses = [
        {
          pose: "standing",
          top: "0px",
          left: "-24px",
        },
      ];
      window.clearInterval(this.animating);
    },
    watchPose() {
      if (this.pose.includes("walk")) {
        // console.log("oh no here we are");
        this.animPoses = this.poses.filter((pose) => {
          //   console.log("pose?", pose.pose.includes(this.pose));
          return pose.pose.includes(this.pose);
        });

        // console.log("this.animPoses mounted", this.animPoses);

        window.clearInterval(this.animating);

        this.animate();
      }

      if (this.pose.includes("standing")) {
        this.stopAnimating();
      }
    },
  },
  computed: {
    top() {
      return this.animPoses[this.animStep].top;
    },
    left() {
      return this.animPoses[this.animStep].left;
    },
  },
  watch: {
    pose() {
      return this.watchPose();
    },
  },
  mounted() {
    this.watchPose();
  },
  unmounted() {
    this.stopAnimating();
  },
};
</script>

<template>
  <div class="sprite-container">
    <img class="sprite" :src="spritesheet" :style="{ top: top, left: left }" />
  </div>
</template>

<style scoped>
.sprite-container {
  width: 24px;
  height: 24px;
  position: relative;
  overflow: hidden;
  z-index: 10;
}
.sprite {
  position: absolute;
}
/* .sprite {
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
} */
</style>
