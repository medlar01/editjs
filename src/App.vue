<template>
    <div id="app">
        <Editjs :data="mock" />
    </div>
</template>

<script>
import Editjs from "./components/Editjs.vue"
import tableMock from './mock/table'

export default {
    name: 'App',
    components: {
        Editjs
    },

    data() {
        return {
            mock: tableMock()
        }
    }
}
</script>

<style>
html,
body,
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    height: 100%;
}
</style>
