<template>
    <div id="app">
        <Editjs v-if="ready" :data="mock" :content="context" :events="events" :dialogs="dialogs" @save="save" />
    </div>
</template>

<script>
import axios from 'axios'
import Editjs from "./components/Editjs.vue"

const baseUrl = process.env.NODE_ENV == 'production' ?
    'http://114.132.201.94:80' : '/bapi'
axios.defaults.baseURL = baseUrl

export default {
    name: 'App',
    components: {
        Editjs,
    },

    data() {
        return {
            events: [],
            dialogs: [],
            context: '',
            ready: false,
            mock: null
        }
    },
    created() {
        this.$cookies.set('act-id', 'b3009f91-4b97-11ec-8fd2-b42e99147792');
        this.$cookies.set('node-id', 'node-b11aw23h0');
        axios.get('/editjs/mata-info/b3009f91-4b97-11ec-8fd2-b42e99147792/node-b11aw23h0')
            .then(res => {
                if (res.status == 200) {
                    this.mock = res.data.tableInfo;
                    this.events = JSON.parse((res.data.behavior.events||"[]").replaceAll('\\\\n', '\\n'));
                    this.dialogs = JSON.parse((res.data.behavior.dialogs||"[]").replaceAll('\\\\n', '\\n'));
                    this.context = res.data.behavior.content;
                    this.ready = true;
                }
            });
    },
    methods: {
        save(data) {
            axios.put('/editjs/mata-info/save/b3009f91-4b97-11ec-8fd2-b42e99147792/node-b11aw23h0', data).then(res => {
                if (res.status == 200) {
                    this.$message.info('保存成功~');
                } else {
                    this.$message.error('保存失败~');
                }
            });
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
