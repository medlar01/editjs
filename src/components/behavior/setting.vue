<template>
    <a-layout class="behavior-setting">
        <a-layout-sider :width="260">
            <a-menu @select="onSelectMenu" mode="inline" :default-selected-keys="[0]">
                <a-menu-item :title="event.field.comment" v-for="(event, index) in events" :key="index">
                    <a-icon type="tags" />
                    <span class="nav-text">{{event.field.comment}}</span>
                </a-menu-item>
            </a-menu>
            <div class="toolbar">
                <a-button type="dashed" shape="round" size="small" icon="edit" @click="fieldVisible = true">
                    新增行为
                </a-button>
            </div>
        </a-layout-sider>
        <a-layout-content style="padding: 20px">
            <a-card v-for="(item, key) in currEvent.events" :title="'事件：' + key" size="small" type="inner" :key="key" style="margin-bottom: 10px">
                <a slot="extra" href="#" @click="$delete(currEvent.events, key)"><a-icon type="close" /></a>
                <ConstEvt v-if="item.bus == 'default'" :actions="item.action" :field-data="fieldData" />
                <ScriptEvt v-else-if="item.bus == 'script'" :actions="item.action" :field-data="fieldData" />
            </a-card>
            <div style="text-align: center">
                <a-button style="width: 150px" type="dashed" shape="round" size="small" icon="edit" @click="evnetVisible = true">
                    添加事件
                </a-button>
            </div>
        </a-layout-content>
        <FieldModal v-model="fieldVisible" :field-data="fieldData" @ok="addFieldEvent" />
        <AddEventDialog v-model="evnetVisible" @ok="addEvent" />
    </a-layout>
</template>

<script>
import ConstEvt from './ConstEvt.vue'
import ScriptEvt from './ScriptEvt.vue'
import { unique } from '@/utils/common'

const AddEventDialog = {
    props: {
        visible: Boolean
    },
    model: {
        event: 'change',
        prop: 'visible'
    },
    data() {
        return {
            innerVisible: false,
            type: 'change',
            bus: 'default'
        }
    },
    watch: {
        visible: {
            handler(n, o) {
                this.innerVisible = n;
            },
            immediate: true
        },
        innerVisible(n, o) {
            this.$emit('change', n);
        }
    },
    render() {
        return (
        <a-modal v-model={this.innerVisible} title="添加事件" onOk={e => {
            this.$emit('ok', {type: this.type, bus: this.bus});
            this.innerVisible = false;
        }}>
            <div>
                事件类型&nbsp;&nbsp;
                <a-select v-model={this.type} placeholder="Basic usage" style="width: 200px">
                    <a-select-option value="change">change</a-select-option>
                    <a-select-option value="input">input</a-select-option>
                    <a-select-option value="keyup">keyup</a-select-option>
                </a-select>
            </div>
            <br/>
            <div>
                执行类型&nbsp;&nbsp;
                <a-select v-model={this.bus} placeholder="Basic usage" style="width: 200px">
                    <a-select-option value="default">基础动作</a-select-option>
                    <a-select-option value="script">脚本逻辑</a-select-option>
                </a-select>
            </div>
        </a-modal>);
    }
}

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
    components: {
        ConstEvt,
        ScriptEvt,
        FieldModal,
        AddEventDialog
    },
    props: {
        events: {
            type: Array,
            default() {
                return []
            }
        },
        fieldData: Object
    },
    data() {
        return {
            currEvent: {},
            fieldVisible: false,
            evnetVisible: false
        }
    },
    created() {
        this.currEvent = this.events[0];
    },
    methods: {
        onSelectMenu({item, key}) {
            this.currEvent = this.events[key];
        },
        addFieldEvent(val) {
            if (val != null) {
                console.log(val);
                this.events.push({
                    field: {
                        id: val.id,
                        comment: val.comment + '/' + val.name.toUpperCase()
                    },
                    events: {}
                })
            }
        },
        addEvent(data) {
            const eventName = `On${data.type}_${unique()}`;
            this.$set(this.currEvent.events, eventName, {
                ...data,
                action: []
            });
        }
    }
}
</script>

<style lang="scss">
.behavior-setting {
    .toolbar {
        margin: 10px 5px;
        text-align: center;
        > button {
            width: 150px;
        }
    }
}
</style>