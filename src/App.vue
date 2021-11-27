<template>
    <div id="app">
        <Editjs v-if="ready" :data="mock" :content="context" :events="events" @save="save" />
    </div>
</template>

<script>
import axios from 'axios'
import Editjs from "./components/Editjs.vue"
import dedent from 'dedent'
const context = dedent`
    <div>
        <span id="f1j47a194g2h" mce-nobor="true" class="unedit mce-field" style="width: 200px">
            员工工号/EMPLOYEE_CODE
            <i class="iconfont iconedit"/>
        </span>
        <span id="l1j47al23q1j" class="unedit mce-field" style="width: 200px">
            员工姓名/EMPLOYEE_NAME
            <i class="iconfont iconedit"/>
        </span>
    </div>`;
const events = [
    {
        field: {
            id: 'f1j47a194g2h',
            comment: '员工工号/EMPLOYEE_CODE'
        },
        events: {
            OnBlur_s1j478f7rfu: {
                type: 'blur',
                bus: 'script',
                action: [
                    {
                        id: 'l1j47al23q1j',
                        comment: '员工姓名/EMPLOYEE_NAME',
                        exec: {
                            type: 'request',
                            method: 'get',
                            url: '/api/query?type=yuantong&postid=11111111111',
                            value: dedent`if (res.data.status == 200) {
                                this.formData.employee_name = res.data.com;
                            }`
                        }
                    }
                ]
            }
        }
    }
];
export default {
    name: 'App',
    components: {
        Editjs,
    },

    data() {
        return {
            events,
            context,
            ready: false,
            mock: null
        }
    },
    created() {
        console.log("events", JSON.stringify(events));
        axios.get("/bapi/editjs/mata-info/b3009f91-4b97-11ec-8fd2-b42e99147792/node-b11aw23h0")
            .then(res => {
                if (res.status == 200) {
                    this.mock = res.data.tableInfo;
                    this.events = JSON.parse(res.data.behavior.events.replaceAll('\\\\n', '\\n'));
                    this.context = res.data.behavior.content;
                    this.ready = true;
                }
            });
    },
    methods: {
        save(data) {
            console.log("save data", data);
            axios.put('/bapi/editjs/mata-info/save/b3009f91-4b97-11ec-8fd2-b42e99147792/node-b11aw23h0', data).then(res => {
                console.log('res', res);
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
