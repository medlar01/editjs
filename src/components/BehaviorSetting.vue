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
                    创建
                </a-button>
            </div>
        </a-layout-sider>
        <a-layout-content style="padding: 20px">
            <a-card v-for="(item, key) in currEvent.events" :title="'事件：' + key" size="small" type="inner" :key="key">
                <a slot="extra" href="#"><a-icon type="close" /></a>
                <a-descriptions v-for="(action, index) in item.action" bordered size="small" :key="index" style="margin-bottom: 10px">
                    <a-descriptions-item label="行为字段">
                        {{action.comment}}
                    </a-descriptions-item>
                    <a-descriptions-item label="执行动作">
                        {{action.exec}}
                    </a-descriptions-item>
                    <a-descriptions-item label="编辑">
                        <a-button shape="round" type="dashed" icon="edit" size="small" />
                    </a-descriptions-item>
                </a-descriptions>
                <a-button style="float: right" type="dashed" shape="round" size="small" icon="edit">
                    添加
                </a-button>
            </a-card>
        </a-layout-content>
    </a-layout>
</template>

<script>
export default {
    props: {
        events: {
            type: Array,
            default() {
                return []
            }
        }
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
            width: 100px;
        }
    }
}
</style>