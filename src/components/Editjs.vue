<template>
    <a-spin class="editjs" :spinning="loading" tip="Loading...">
        <a-tabs style="height: 100%" v-model="akey" size="small" :tabBarGutter="10" :tabBarExtraContent='createTabToolbar' :tabBarStyle="{padding: '0 10px'}">
            <div slot="toolbar">123</div>
            <a-tab-pane key="tab-1" tab="设计器">
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
                                        <a-tree-node :disabled="f.disabled" v-for="(f, idx) in data.main.fields" :selectable="false" :key="'field-' + idx" :title="f.comment + '/' + f.name.toUpperCase()" @dblclick.native="insertField(1, f)" />
                                    </a-tree-node>
                                    <a-tree-node :selectable="false" key="lines" title="明细表">
                                        <a-tree-node :disabled="t.disabled" v-for="(t, idx) in data.lines" :selectable="false" :key="'lines-' + idx" :title="t.table_comment + '/' + t.table_name.toUpperCase()" @dblclick.native="insertField(0, t)" />
                                    </a-tree-node>
                                </a-tree>
                                <a-icon slot="extra" type="setting" />
                            </a-collapse-panel>
                        </a-collapse>
                    </a-layout-sider>
                    <a-layout-content>
                        <Tinymce lang="zh_CN" @preview="preview" @init-event="loading = false" 
                            :field-info="{...data.main, lines: data.lines }" @line-event="editLineTable" ref="tmceInstance" />
                    </a-layout-content>
                </a-layout>
            </a-tab-pane>
            <a-tab-pane key="tab-2" tab="表单设置">
                Content of Tab Pane 2
            </a-tab-pane>
            <a-tab-pane key="tab-3" tab="行为设置">
                Content of Tab Pane 3
            </a-tab-pane>
            <a-tab-pane v-for="(title, idx) in tabs" :key="'tab-' + (4 + idx)">
                <span slot="tab">
                    <span style="margin-right: 5px">{{title}}</span>
                    <a-icon class="tab-close" type="close" style="margin-right: 0" @click="closeTab(idx)" />
                </span>
                <EditLine :ref="'editLine' + (4 + idx)" @init-event="loading = false" :data="editLines[idx]" :actTab="akey" :tabIndex="'tab-' + (4 + idx)" />
            </a-tab-pane>
        </a-tabs>
    </a-spin>
</template>

<script>
import Tinymce from './Tinymce.vue'
import EditLine from './EditLine.vue'
import ErdMaker from 'element-resize-detector'
import { constTableTpl } from './const'
import { unique } from './plugin'

export default {
    components: {
        Tinymce,
        EditLine
    },

    props: {
        data: {
            type: Object,
            default() {
                return {}
            }
        }
    },

    data() {
        return {
            akey: 'tab-1',
            height: 0,
            tabs: [],
            editLines: [],
            loading: true
        }
    },

    watch: {
        'akey': function (n, o) {
            if (n != o && n == 'tab-1') {
                this.$refs.tmceInstance.rebuild();
            }
        }
    },

    created() {
        const main = this.data.main.fields;
        for (let index = 0; index < main.length; index++) {
            const element = main[index];
            this.$set(element, 'id', unique());
            this.$set(element, 'disabled', false);
        }
        const lines = this.data.lines;
        for (let index = 0; index < lines.length; index++) {
            this.$set(lines[index], 'id', unique());
            this.$set(lines[index], 'disabled', false);
            for (let idx = 0; idx < lines[index].fields.length; idx++) {
                const element = lines[index].fields[idx];
                this.$set(element, 'id', unique());
                this.$set(element, 'disabled', false);
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
        closeTab(index) {
            this.tabs.splice(index, 1);
            setTimeout(() => { this.akey = 'tab-1' });
        },

        insertField(isMain, meta) {
            if (meta.disabled) return;
            const { tmceInstance } = this.$refs;
            if (isMain) {
                tmceInstance.insertField(meta);
            } else {
                this.openTab(meta);
            }
        },

        createTabToolbar() {
            if (!['tab-2', 'tab-3'].includes(this.akey)) {
                return (<a-button type="dashed" size="small" shape="round" onClick={this.tabSave}><a-icon type="save" theme="filled" />保存</a-button>)
            }
        },

        tabSave() {
            const actTab = this.akey;
            const { tmceInstance } = this.$refs;
            switch (actTab) {
                case 'tab-1':
                case 'tab-2':
                case 'tab-3':
                    break;
                default: {
                    const split = actTab.split('-');
                    const ref = this.$refs['editLine' + split[1]];
                    if (ref && ref.length > 0) {
                        const ctx = ref[0].save();
                        ref[0].distory();
                        this.akey = 'tab-1';
                        // 销毁明细行面板
                        const index = this.tabs.indexOf(ctx.meta.table_comment);
                        if (index > -1) {
                            this.tabs.splice(index, 1);
                            this.editLines.splice(index, 1);
                        }
                        this.loading = true;
                        $syncLoading(this, () => {
                            tmceInstance.insertLineTable(ctx);
                        })
                    }
                }

            }
        },

        editLineTable(e, meta) {
            this.openTab(meta, e.target.innerHTML);
        },

        openTab(meta, ctx) {
            this.loading = true;
            const { tmceInstance } = this.$refs;
            let index = this.tabs.indexOf(meta.table_comment);
            if (index < 0) {
                this.tabs.push(meta.table_comment);
                index = this.tabs.length - 1;
            }
            this.editLines[index] = meta;
            this.akey = 'tab-' + (4 + index);
            
            if (!ctx) {
                tmceInstance.insertLineTable({ meta });
            }
            const self = this;
            $syncLoading(this, () => {
                const ref = self.$refs['editLine' + (4 + index)][0];
                ref.setContent(ctx || constTableTpl);
            })
        },

        preview(event) {
            const body = event.target.dom.create('body', {}, event.content);
            console.log('preview', event, body);
            const DOMUtils = event.target.resolve('tinymce.dom.DOMUtils');
            const fieldNodes = DOMUtils.DOM.$('.mce-field', body);
            fieldNodes.each(function(idx, n) {
                const input = event.target.dom.create('input', { class: 'mce-field', id: n.id });
                (n.parentElement || n.parentNode).replaceChild(input, n);
            });
            const tableNodes = DOMUtils.DOM.$('.mce-table-line', body);
            tableNodes.each(function(idx, n) {
                const div = event.target.dom.create('div', {}, n.innerHTML);
                (n.parentElement || n.parentNode).replaceChild(div, n);
            });
            event.content = body.innerHTML;
        }
    }
}

function $syncLoading(self, callback) {
    const timer = setInterval(() => {
        if (!self.loading) {
            clearInterval(timer);
            callback();
        }
    }, 500);
}
</script>

<style lang="scss">
.editjs {
    height: 100%;
    .ant-spin-container {
        height: 100%;
    }
    .ant-tabs-bar {
        margin-bottom: 0px;
    }
    .ant-tabs-content,
    .ant-tabs-tabpane {
        height: 100%;
    }
    .ant-layout {
        height: calc(100% - 36px);
    }
    .ant-layout-sider,
    .ant-layout-content {
        background-color: white;
        border: 1px solid #e8e8e8;
    }

    .ant-collapse-content > .ant-collapse-content-box {
        border-top: 1px solid #d9d9d9;
        background-color: white;
        padding: 1px;
        [class^="ant-tree-treenode-switcher"] {
            font-size: 12px;
            user-select: none;
            li {
                padding: 2px 0;
            }
        }
    }

    .tab-close {
        color: #808080;
        &:hover {
            color: black;
        }
    }
}
</style>