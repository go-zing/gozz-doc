<template>
    <div style="border: 1px solid #eeeeee;overflow: hidden;width: 100%">
        <div ref="swagger"/>
    </div>
</template>

<script>

import {load} from './load'

export default {
    name: "swagger",
    props: ['src'],
    data() {
        return {
            image: ""
        }
    },
    mounted() {
        load('https://unpkg.com/swagger-ui-dist@5.9.1/swagger-ui-bundle.js', () => {
            SwaggerUIBundle({
                url: this.src,
                domNode: this.$refs.swagger,
                presets: [SwaggerUIBundle.presets.apis],
            })
        })
    }
}
</script>

<style scoped>
@import url('https://unpkg.com/swagger-ui-dist@5.9.1/swagger-ui.css');
</style>