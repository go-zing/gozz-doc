<template>
    <div style="border: 1px solid #eeeeee;overflow: hidden;width: 100%">
        <div ref="swagger"/>
    </div>
</template>

<script>

export default {
    name: "swagger",
    props: ['src'],
    data() {
        return {
            image: ""
        }
    },
    mounted() {
        SwaggerUIBundle({
            url: this.src,
            domNode: this.$refs.swagger,
            presets: [
                SwaggerUIBundle.presets.apis,
            ],
        })
    }
}
</script>

<style scoped>

</style>