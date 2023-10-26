<template>
    <div v-if="image" align="center" style="max-width: 100%;overflow: scroll" v-html="image"/>
</template>

<script>
export default {
    name: "svgx",
    props: ['src'],
    data() {
        return {
            image: ""
        }
    },
    mounted() {
        axios.get( this.src).then(({data})=>{
            this.image = data;
        })
    }
}
</script>

<style scoped>

</style>