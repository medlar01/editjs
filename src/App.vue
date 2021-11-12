<template>
    <div id="app">
        <Editjs :data="mock" :content="context" :events="events" />
    </div>
</template>

<script>
import Editjs from "./components/Editjs.vue"
import tableMock from './mock/table'
const context = '<div><span id="f1j47a194g2h" class="unedit mce-field">员工工号/EMPLOYEE_CODE</span><span id="l1j47al23q1j" class="unedit mce-field">员工姓名/EMPLOYEE_NAME</span></div>';
const events = [
    {
        field: {
            id: 'f1j47a194g2h',
            comment: '员工工号/EMPLOYEE_CODE'
        },
        events: {
            OnChange_s1j478f7rfu: {
                type: 'change',
                bus: 'default',
                action: [
                    {
                        id: 'l1j47al23q1j',
                        comment: '员工姓名/EMPLOYEE_NAME',
                        exec: null
                    }
                ]
            }
        }
    }
];
export default {
    name: 'App',
    components: {
        Editjs
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
