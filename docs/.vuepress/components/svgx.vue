<template>
    <div v-if="image" align="center" style="max-width: 100%;overflow: scroll" v-html="image"/>
</template>

<script>
import {load} from "./load";

export default {
    name: "svgx",
    props: ['src'],
    data() {
        return {
            image: ""
        }
    },
    mounted() {
        load('https://unpkg.com/axios@1.5.1/dist/axios.min.js', () => {
            axios.get(this.src).then(({data}) => {
                this.image = data;
            })
        })
    }
}
</script>

<style scoped>

</style>