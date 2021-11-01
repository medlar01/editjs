<template>
    <a-layout>
        <a-layout-sider :width="260" ref="leftPanel">
            <a-collapse defaultActiveKey="2" :accordion="true" expand-icon-position="left" :bordered="false">
                <a-collapse-panel key="1" header="组件库" forceRender>
                    <p :style="{height: height - 116 + 'px', overflow: 'auto'}">collapse demo</p>
                    <a-icon slot="extra" type="setting" />
                </a-collapse-panel>
                <a-collapse-panel key="2" header="数据源">
                    <a-tree blockNode :style="{height: height - 102 + 'px', overflow: 'auto'}" :show-line="true" :show-icon="true" :default-expanded-keys="['main']">
                        <a-tree-node :selectable="false" key="main" title="主表">
                            <a-tree-node :disabled="f.disabled" v-for="(f, idx) in data.fields" :selectable="false" :key="'field-' + idx" :title="f.comment + '/' + f.name.toUpperCase()" @dblclick.native="insertField(f)" />
                        </a-tree-node>
                    </a-tree>
                    <a-icon slot="extra" type="setting" />
                </a-collapse-panel>
            </a-collapse>
        </a-layout-sider>
        <a-layout-content>
            <Tinymce lang="zh_CN" ref="tmceInstance" :field-info="data" @init-event="$emit('init-event')" is-line :value="value" />
        </a-layout-content>
    </a-layout>
</template>

<script>
import Tinymce from './Tinymce.vue'
import ErdMaker from 'element-resize-detector'

export default {
    components: {
        Tinymce
    },

    props: {
        data: {
            type: Object,
            default() {
                return {}
            }
        },
        actTab: [String, Number],
        tabIndex: [String, Number]
    },

    data() {
        return {
            height: 0,
            value: ''
        }
    },

    watch: {
        'actTab': function (n, o) {
            if (n != o && n == this.tabIndex) {
                this.$refs.tmceInstance.rebuild();
            }
        }
    },

    mounted() {
        const self = this;
        ErdMaker().listenTo(this.$refs.leftPanel.$el, function (element) {
            self.height = element.offsetHeight;
        })
    },

    methods: {
        insertField(meta) {
            if (meta.disabled) return;
            const { tmceInstance } = this.$refs;
            tmceInstance.insertField(meta);
        },

        setContent(ctx) {
            const { tmceInstance } = this.$refs;
            tmceInstance.setContent(ctx);
        },

        save() {
            const { tmceInstance } = this.$refs;
            return {
                meta: this.data,
                ctx: tmceInstance.getContent()
            };
        },
        
        distory() {
            const { tmceInstance } = this.$refs;
            tmceInstance.distory();
        },
    }
}
</script>

<style>
</style>