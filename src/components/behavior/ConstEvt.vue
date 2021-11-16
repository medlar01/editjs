<template>
    <div>
        <a-table :columns="columns" :data-source="actions" bordered rowKey="id" size="middle" :pagination="false" style="margin-bottom: 10px"/>
        <a-button style="float: right" type="dashed" shape="round" size="small" icon="edit" @click="visible = true">
            添加
        </a-button>
        <FieldModal v-model="visible" :field-data="fieldData" @ok="(val) => {
            if (val) {
                this.actions.push({ id: val.id, comment: val.comment + '/' + val.name.toUpperCase(), exec: { type: 'Empty', value: null } });
            }
        }" />
    </div>
</template>
<script>
const FieldModal = {
    props: {
        visible: Boolean, fieldData: Object,
    },
    data() {
        return {
            vis: false, value: null
        }
    },
    model: {
        prop: 'visible', event: 'change'
    },
    watch: {
        visible(n, o) {
            if (n != o) this.vis = n
        },
        vis(n, o) {
            if (n != o) {
                this.$emit('change', n)
            }
        }
    },
    render() {
        return (
            <a-modal v-model={this.vis} title="选择字段" v-on:ok={() => {
                this.$emit('ok', this.value);
                this.vis = false;
            }}>
                <a-tree blockNode show-line show-icon default-expanded-keys={['main']} onSelect={(keys, info) => {
                    window.console.log('select', keys, info)
                    if (keys.length > 0) {
                        const split = keys[0].split('-');
                        if (split[0] == 'field') {
                            this.value = this.fieldData.main.fields[split[1]];
                        } else {
                            this.value = this.fieldData.lines[split[1]];
                        }
                    }
                }}>
                    <a-tree-node selectable={false} key="main" title="主表">
                        {this.fieldData.main.fields.map((f, idx) => (<a-tree-node key={'field-' + idx} title={f.comment + '/' + f.name.toUpperCase()} />))}
                    </a-tree-node>
                    <a-tree-node selectable={false} key="lines" title="明细表">
                        {this.fieldData.lines.map((t, idx) => (<a-tree-node key={'lines-' + idx} title={t.table_comment + '/' + t.table_name.toUpperCase()} />))}
                    </a-tree-node>
                </a-tree>
            </a-modal>)
    }
}

export default {
    components: {FieldModal},
    props: {
        actions: Array,
        fieldData: Object
    },
    data() {
        return {
            visible: false,
            columns: [{
                key: 'comment',
                dataIndex: 'comment',
                title: '执行字段',
                width: 300
            }, {
                key: 'exec',
                dataIndex: 'exec',
                title: '执行动作',
                customRender: (value, row, idx) => {
                    let slot = '';
                    switch(row.exec.type) {
                        case "const": {
                            slot = (<a-input size="small" style="width: calc(100% - 110px); max-width: 200px" placeholder="请输入默认值" v-model={row.exec.value} />);
                            break;
                        }
                    }
                    return (
                    <div style="min-width: 100px">
                        <a-select default-value="empty" size="small" style="width: 100px; vertical-align: top" v-model={row.exec.type}
                            onChange={(val) => {
                                row.exec.type = val;
                                if (val != 'const') row.exec.value = null;
                            }}>
                            <a-select-option value="empty"> EMPTY </a-select-option>
                            <a-select-option value="const"> CONST </a-select-option>
                        </a-select>&nbsp;
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
