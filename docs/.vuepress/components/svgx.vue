<template>
    <div align="center" style="max-width: 100%;overflow: scroll" v-html="image"/>
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
        let req = new XMLHttpRequest();
        req.open('GET', this.src, true);
        req.send()
        req.onreadystatechange = () => {
            if (req.readyState === 4 && req.status === 200) {
                this.image = req.responseText;
            }
        };
    }
}
</script>

<style scoped>

</style>