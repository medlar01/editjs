<template>
    <div>
        <a-table :columns="columns" :data-source="actions" bordered rowKey="id" size="middle" :pagination="false" style="margin-bottom: 10px"/>
        <a-button style="float: right" type="dashed" shape="round" size="small" icon="edit" @click="actions.push({
            id: unique(),
            exec: {
                type: 'request',
                method: 'get',
            }
        })">
            添加
        </a-button>
    </div>
</template>
<script>
import VueCodemirror from "../VueCodemirror.vue"
import { unique } from '@/utils/common'
export default {
    props: {
        actions: Array,
        fieldData: Object
    },
    mixins: [{ methods: { unique } }],
    data() {
        return {
            visible: false,
            columns: [{
                key: 'comment',
                dataIndex: 'comment',
                title: '脚本类型',
                width: 120,
                customCell: () => {
                    return {
                        style: 'vertical-align: top'
                    }
                },
                customRender: (value, row, idx) => {
                    return (
                        <a-select default-value="request" size="small" style="width: 100px; vertical-align: top" v-model={row.exec.type}>
                            <a-select-option value="script"> SCRIPT </a-select-option>
                            <a-select-option value="request"> REQUEST </a-select-option>
                        </a-select>
                    ) 
                }

            }, {
                key: 'exec',
                dataIndex: 'exec',
                title: '执行动作',
                customRender: (value, row, idx) => {
                    let slot = '';
                    switch(row.exec.type) {
                        case "script": {
                            slot = (<VueCodemirror v-model={row.exec.value} />);
                            break;
                        }
                        case "request": {
                            slot = (<span>
                                <a-select default-value="get" size="small" style="width: 100px" v-model={row.exec.method}
                                    onChange={(val) => {
                                    row.exec.method = val;
                                    if (val != 'const') row.exec.value = null;
                                }}>
                                    <a-select-option value="get"> GET </a-select-option>
                                    <a-select-option value="post"> POST </a-select-option>
                                </a-select>&nbsp;
                                <a-input size="small" placeholder="请输入地址" style="width: calc(100% - 105px)" v-model={row.exec.url} />
                                <br />
                                <br />
                                <VueCodemirror v-model={row.exec.value} />
                            </span>);
                            break;
                        }
                    }
                    return (
                    <div style="min-width: 100px">
                        {slot}
                    </div>)
                }
            }, {
                key: '-',
                dataIndex: '-',
                title: '//',
                width: 50,
                align: "center",
                customRender: (val, row, idx) => {
                    return (<a-button onClick={() => this.actions.splice(idx, 1)} shape="round" type="dashed" icon="delete" size="small"/>)
                }
            }]
        }
    }
};
</script>
