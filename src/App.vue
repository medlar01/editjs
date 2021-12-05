<template>
    <div id="app">
        <Editjs ref="edit" v-if="ready && show" :data="mock" :content="context" :events="events" :dialogs="dialogs" @save="save" />
        <div v-if="!show" style="padding: 50px 0">
            <Load ref="load" :printMode="printMode" :link="link" />
            <div style="text-align: center">
                <a-button-group>
                    <a-button v-show="printMode" size="small" type="dashed" @click="printMode = false">编辑模式</a-button>
                    <a-button v-show="!printMode" size="small" type="dashed" @click="printMode = true">打印模式</a-button>
                    <a-button v-show="!printMode" size="small" type="dashed" @click="submit">获取数据集</a-button>
                    <a-button size="small" type="dashed" @click="show = true">返回设计器</a-button>
                </a-button-group>
            </div>
        </div>
        <a-modal
            title="Title"
            :visible="visible"
            @ok="genVuejs"
            @cancel="visible = false"
            :confirm-loading="confirmLoading"
            cancelText="否"
            okText="是"
        >
            <p>是否需要生成vuejs编译文件?</p>
        </a-modal>
    </div>
</template>

<script>
import axios from 'axios'
import Editjs from "./components/Editjs.vue"
import Load from './components/load'
import '@/mock'
const baseUrl = process.env.NODE_ENV == 'production' ?
    '' : '/bapi'
axios.defaults.baseURL = baseUrl

import Vue from 'vue'
import Field from './components/field'
Vue.use(Field)


export default {
    name: 'App',
    components: {
        Editjs,
        Load
    },

    data() {
        return {
            events: [],
            dialogs: [],
            context: '',
            show: true,
            ready: false,
            mock: null,
            visible: false,
            confirmLoading: false,
            printMode: false,
            link: baseUrl + '/editjs/gen/b3009f91-4b97-11ec-8fd2-b42e99147792/node-b11aw23h0.js'
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
                    this.visible = true;
                } else {
                    this.$message.error('保存失败~');
                }
            });
        },
        genVuejs() {
            this.confirmLoading = true
            const edit = this.$refs.edit;
            const html = edit.genVuejs()
                .replace(/&lt;/g, '<')
                .replace(/\\n/g, '\n')
            axios.post('/editjs/gen', {html}).then(res => {
                console.log("genVuejs ...", res);
                this.visible = false
                this.show = false
                this.confirmLoading = false
            })
        },
        submit() {
            const load = this.$refs.load;
            if (!load.validation()) {
                setTimeout(() => alert(JSON.stringify(load.getData())), 100)
            }
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
