<template>
    <div>
        <a-descriptions
            v-for="(action, index) in actions"
            bordered
            size="small"
            :key="index"
            style="margin-bottom: 10px"
        >
            <a-descriptions-item label="行为字段">
                {{ action.comment }}
            </a-descriptions-item>
            <a-descriptions-item label="执行动作">
                <div style="min-width: 100px">
                    <a-select
                        default-value="Empty"
                        size="small"
                        @change="
                            (val) => {
                                action.exec.type = val;
                                if (val == 'Empty') action.exec.value = null;
                            }
                        "
                    >
                        <a-select-option value="Empty"> EMPTY </a-select-option>
                        <a-select-option value="Custom">
                            CUSTON
                        </a-select-option> </a-select
                    >&nbsp;
                    <a-input
                        size="small"
                        style="width: 100px"
                        v-show="action.exec.type != 'Empty'"
                        v-model="action.exec.value"
                    />
                </div>
            </a-descriptions-item>
            <a-descriptions-item label="删除">
                <a-button
                    @click="actions.splice(index, 1)"
                    shape="round"
                    type="dashed"
                    icon="delete"
                    size="small"
                />
            </a-descriptions-item>
        </a-descriptions>
        <a-button style="float: right" type="dashed" shape="round" size="small" icon="edit" @click="visible = true">
            添加
        </a-button>

        <!-- 窗口选择字段 -->
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
            visible: false
        }
    }
};
</script>
