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
                <a-button type="dashed" shape="round" size="small" icon="edit">
                    新增行为
                </a-button>
            </div>
        </a-layout-sider>
        <a-layout-content style="padding: 20px">
            <a-card v-for="(item, key) in currEvent.events" :title="'事件：' + key" size="small" type="inner" :key="key" style="margin-bottom: 10px">
                <a slot="extra" href="#" @click="$delete(currEvent.events, key)"><a-icon type="close" /></a>
                <Def :actions="item.action" :field-data="fieldData" />
            </a-card>
            <div style="text-align: center">
                <a-button style="width: 150px" type="dashed" shape="round" size="small" icon="edit">
                    添加事件
                </a-button>
            </div>
        </a-layout-content>

        <!-- 行为字段选择 -->
        
    </a-layout>
</template>

<script>
import Def from './Def.vue'
export default {
    components: {
        Def
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
            currEvent: {}
        }
    },
    created() {
        console.log("events", this.events);
        this.currEvent = this.events[0];
    },
    methods: {
        onSelectMenu({item, key}) {
            this.currEvent = this.events[key];
        },
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