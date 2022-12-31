<script>
export default {
    props: {
        burnRate: Number,
        currentBurn: Number,
        label: String,
    },
    computed: {
        dots(){
            if(this.currentBurn < 0){
                return []
            }
            let numDots = this.burnRate - this.currentBurn;
            return new Array(numDots)
        }
    }
}
</script>

<template>
    <button>
        <span class="label">{{ label }}</span>
        <span class="dot" v-for="dot in dots"></span>
    </button>
</template>

<style scoped>
button {
    display: flex;
    align-items: center;
    justify-content: center;
}

.dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: #fff;
    display: inline-block;
    margin-left: 4px;
}
</style>