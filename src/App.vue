<template>
    <div id="app">
        <Editjs :data="mock" :content="context" :events="events" />
    </div>
</template>

<script>
import Editjs from "./components/Editjs.vue"
import tableMock from './mock/table'
import dedent from 'dedent'
const context = dedent`
    <div>
        <span id="f1j47a194g2h" class="unedit mce-field" style="width: 200px">
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
