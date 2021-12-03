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
                        <Tinymce lang="zh_CN" @preview="preview" @init-event="loading = false" :config="config"
                            :field-info="{...data.main, lines: data.lines }" ref="tmceInstance" :value="content" />
                    </a-layout-content>
                </a-layout>
            </a-tab-pane>
            <a-tab-pane key="tab-2" tab="表单设置">
                <FormSetting :data="data" :dialogs="dialogs" />
            </a-tab-pane>
            <a-tab-pane key="tab-3" tab="行为设置">
                <BehaviorSetting :events="events" :field-data="data" />
            </a-tab-pane>
            <a-tab-pane v-for="(title, idx) in tabs" :key="'tab-' + (4 + idx)">
                <span slot="tab">
                    <span style="margin-right: 5px">{{title}}</span>
                    <a-icon class="tab-close" type="close" style="margin-right: 0" @click="closeTab(idx)" />
                </span>
                <EditLine :ref="'editLine' + (4 + idx)" :plugins="plugins" @init-event="loading = false" :data="{main: editLines[idx]}" :actTab="akey" :tabIndex="'tab-' + (4 + idx)" />
            </a-tab-pane>
        </a-tabs>
    </a-spin>
</template>

<script>
import axios from 'axios' 
import Tinymce from './Tinymce.vue'
import EditLine from './EditLine.vue'
import FormSetting from './FormSetting.vue'
import BehaviorSetting from './behavior'
import ErdMaker from 'element-resize-detector'
import prettier from 'prettier'
import parserHtml from 'prettier/parser-html'
import parserBabel from 'prettier/parser-babel'
import { constTableTpl } from './config'
import plugin from './plugin'
import { unique } from '@/utils/common'
import conversions from './conversion'
import { 
    inputMaker,
    textareaMaker,
    dateMaker,
    selectMaker,
    dialogMaker,
} from './field'
export default {
    components: {
        Tinymce,
        EditLine,
        FormSetting,
        BehaviorSetting
    },

    props: {
        data: {
            type: Object,
            default() {
                return {}
            }
        },
        content: {
            type: String,
            default: ''
        },
        events: {
            type: Array,
            default() {
                return []
            }
        },
        dialogs: {
            type: Array,
            default() {
                return []
            }
        },
        plugins: {
            type: Array,
            default() {
                return []
            }
        },
        conversions: {
            type: Array,
            default() {
                return []
            }
        }
    },

    data() {
        return {
            akey: 'tab-1',
            height: 0,
            tabs: [],
            editLines: [],
            loading: true,
            config: {},
            insidePlugins: [],
        }
    },

    watch: {
        'akey': function (n, o) {
            if (n != o && n == 'tab-1') {
                this.$refs.tmceInstance.reload();
            }
        }
    },

    created() {
        const vm = this;
        this.plugins.push(plugin);
        this.insidePlugins = this.insidePlugins.concat([...this.plugins, (_, edi) => edi.on('preview', (e) => vm.preview(e)), g_plugin]);
        conversions.map(conversion => this.conversions.push(conversion));
        this.config['setup'] = function(editor) {
            const plugins = vm.insidePlugins;
            for (let index = 0; index < plugins.length; index++) {
                const plugin = plugins[index];
                plugin(vm, editor);
            }
        }
        
        const main = this.data.main.fields;
        function $set(el) {
            if (!el.id) vm.$set(el, 'id', unique());
            vm.$set(el, 'disabled', false);
        }
        for (let index = 0; index < main.length; index++) {
            $set(main[index]);
        }
        const lines = this.data.lines;
        for (let index = 0; index < lines.length; index++) {
            $set(lines[index]);
            for (let idx = 0; idx < lines[index].fields.length; idx++) {
                $set(lines[index].fields[idx]);
            }
        }
    },

    mounted() {
        const self = this;
        ErdMaker().listenTo(this.$refs.leftPanel.$el, function (element) {
            self.height = element.offsetHeight;
        });
    },

    methods: {
        closeTab(index) {
            this.tabs.splice(index, 1);
            setTimeout(() => { this.akey = 'tab-1' });
        },

        insertField(isMain, metadata) {
            if (metadata.disabled) return;
            const { tmceInstance } = this.$refs;
            if (isMain) {
                const { DOM } = g_resolve('tinymce.dom.DOMUtils');
                const args = { class: 'unedit mce-field', id: metadata.id, style: 'width: 200px;' + (metadata.noBorder ? 'border: 1px dashed' : '') };
                const htmlField = DOM.create('span', args, metadata.comment + '/' + metadata.name.toUpperCase() + '<i class="iconfont iconedit"/>');
                tmceInstance.insertElement(htmlField);
                metadata.disabled = true;
                tmceInstance.focus();
            } else {
                this.openTab(metadata);
            }
        },

        insertLineTable(metadata, ctx) {
            const tmceInstance = this.$refs.tmceInstance;
            const { DOM } = g_resolve('tinymce.dom.DOMUtils');
            let lineTableBlock = DOM.$('#' + metadata.id, g_activeEditor().getDoc());
            if (lineTableBlock.length > 0) {
                lineTableBlock = lineTableBlock[0];
                lineTableBlock.innerHTML = ctx;
                this.ctx = tmceInstance.getContent();
                return;
            }
            const htmlLineTable = DOM.create('div', { class: 'unedit mce-table-line', title: metadata.table_comment, id: metadata.id });
            htmlLineTable.innerHTML = ctx || '';
            tmceInstance.insertElement(htmlLineTable);
            metadata.disabled = true;
            tmceInstance.focus();
            this.ctx = tmceInstance.getContent();
        },

        editLineTable(e, metadata) {
            this.openTab(metadata, e.target.innerHTML);
        },

        createTabToolbar() {
            if (!['tab-2', 'tab-3'].includes(this.akey)) {
                return (<a-button type="dashed" size="small" shape="round" onClick={this.tabSave}><a-icon type="save" theme="filled" />保存</a-button>)
            }
        },

        tabSave() {
            const actTab = this.akey;
            switch (actTab) {
                case 'tab-1':
                    this.$emit('save', {
                        tableInfo: this.data,
                        behavior: {
                            content: this.$refs.tmceInstance.getContent(),
                            events: JSON.stringify(this.events),
                            dialogs: JSON.stringify(this.dialogs)
                        }
                    });
                    break;
                case 'tab-2':
                case 'tab-3':
                    break;
                default: {
                    const split = actTab.split('-');
                    const ref = this.$refs['editLine' + split[1]];
                    if (ref && ref.length > 0) {
                        this.loading = true;
                        const result = ref[0].save();
                        ref[0].distory();
                        this.akey = 'tab-1';
                        // 销毁明细行面板
                        const index = this.tabs.indexOf(result.metadata.table_comment);
                        if (index > -1) {
                            this.tabs.splice(index, 1);
                            this.editLines.splice(index, 1);
                        }
                        g_syncLoading(this, () => {
                            this.insertLineTable(result.metadata, result.ctx);
                        });
                    }
                }

            }
        },

        openTab(metadata, ctx) {
            this.loading = true;
            if (!ctx) {
                this.insertLineTable(metadata);
            }
            let index = this.tabs.indexOf(metadata.table_comment);
            if (index < 0) {
                this.tabs.push(metadata.table_comment);
                index = this.tabs.length - 1;
            }

            this.editLines[index] = metadata;
            const self = this;
            this.akey = 'tab-' + (4 + index);
            g_syncLoading(this, () => {
                const ref = self.$refs['editLine' + (4 + index)][0];
                ref.setContent(ctx || constTableTpl);
            });
        },

        preview(event) {
            const ctx = {};
            const conversions = this.conversions;
            const DOMUtils = event.target.resolve('tinymce.dom.DOMUtils');
            conversions.map(conversion => conversion(this, event, ctx));
            // 底部添加按钮
            const gbtms = DOMUtils.DOM.create('div', {style: 'background-color: #5857570d; position: fixed; top: 487px; right: 0; border-radius: 8px'});
            const btm1 = DOMUtils.DOM.create('a-button', {'v-on:click': 'printMode = false','v-show': 'printMode', type: 'link'}, '编辑模式');
            const btm2 = DOMUtils.DOM.create('a-button', {'v-on:click': 'printMode = true', 'v-show': '!printMode', type: 'link'}, '打印模式');
            const btm3 = DOMUtils.DOM.create('a-button', {'v-on:click': `() => {
                if (!this.validation()) {
                    setTimeout(() => alert(JSON.stringify(this.form)), 100)
                }
            }`, type: 'link'}, '获取数据');
            const btm4 = DOMUtils.DOM.create('a-button', {'v-on:click': 'window.print()', 'v-show': 'printMode', type: 'link'}, '页面打印');
            gbtms.appendChild(btm1);
            gbtms.appendChild(btm2);
            gbtms.appendChild(btm3);
            gbtms.appendChild(btm4);
            ctx['body'].appendChild(gbtms);
            const content = ctx['body'].innerHTML;
            ctx['body'].innerHTML = '';
            const div = DOMUtils.DOM.create('div', {id: 'app'});
            ctx['body'].appendChild(div);
            const vue = DOMUtils.DOM.create('script', {src: 'https://cdn.jsdelivr.net/npm/vue@2'});
            const antdLink = DOMUtils.DOM.create('link', {rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/ant-design-vue@1.7.8/dist/antd.css'});
            const antd = DOMUtils.DOM.create('script', {src: 'https://cdn.jsdelivr.net/npm/ant-design-vue@1.7.8/dist/antd.js'});
            const moment = DOMUtils.DOM.create('script', {src: 'https://cdn.jsdelivr.net/npm/moment@2.29.1/moment.js'});
            ctx['body'].appendChild(vue);
            ctx['body'].appendChild(moment);
            ctx['body'].appendChild(antdLink);
            ctx['body'].appendChild(antd);
            ctx['data'].moment = 'moment';
            const metds = ctx['methods'];
            if (g_hasKey(ctx['props'], 'printMode')) {
                ctx['data'].printMode = ctx['props'].printMode?.default || false;
                delete ctx['props'].printMode;
            }
            const script = DOMUtils.DOM.create('script', {type: "text/javascript"}, `
                (function() {
                    const win = window.parent;
                    const doc = win.document;
                    const page = doc.querySelector('div[role="dialog"] .tox-dialog__body-content');
                    page.style.height = '557px';
                    setInterval(() => {
                        page.style.height = '557px';
                    }, 500);
                    const p = win.__PREVIEW__;
                    const components = {};
                    Object.keys(p.components).map(i => components[i] = p.components[i]());
                    Vue.prototype.axios = p.axios;
                    p.$app  = new Vue({
                        el: '#app',
                        props: ${JSON.stringify(ctx['props'], null, 4).replace(/"type": "([^"]+)"/g, 'type: $1')},
                        data: ${JSON.stringify(ctx['data'], null, 4).replace(/"moment": "([^"]+)"/g, 'moment: $1')},
                        template: \`<div>${content}</div>\`,
                        components: components,
                        provide() { return {vm: this} },
                        methods: {
                            ${Object.keys(metds).map(key => key + metds[key] + ' ')}
                        }
                    });
                })();
            `);
            ctx['body'].appendChild(script);
            event.content = ctx['body'].innerHTML;
            window['__PREVIEW__'] = {
                axios,
                components: {
                    'f-input': inputMaker,
                    'f-textarea': textareaMaker,
                    'f-date': dateMaker,
                    'f-select': selectMaker,
                    'f-dialog': dialogMaker,
                }
            };
        }
    }
}

function g_plugin(vm, edi) {
    edi.on('winopen', (event) => {
        if (event.args.title == 'Preview') {
            event.content = edi.getBody().innerHTML;
            // 重定义布局
            const items = event.args.body.items;
            items[0].sandboxed = false;
            const tabs = [
                {
                    items,
                    name: 'page',
                    title: '页面'
                },
                {
                    items: [
                        {
                            name: 'code',
                            sandboxed: false,
                            type: 'iframe'
                        }
                    ],
                    name: 'code',
                    title: '代码'
                }
            ];
            event.args.body = {
                tabs,
                type: "tabpanel"
            }
            const ctx = {};
            const conversions = vm.conversions;
            conversions.map(conversion => conversion(vm, event, ctx));
            const content = ctx['body'].innerHTML;
            const metds = ctx['methods'];
            const html = prettier.format(`<template>${content}</template><script>export default {
                    props: ${JSON.stringify(ctx['props'], null, 4).replace(/"type": "([^"]+)"/g, 'type: $1')},
                    data() { return ${JSON.stringify(ctx['data'], null, 4).replace(/"moment": "([^"]+)"/g, 'moment: $1')} }, 
                    provide() { return {vm: this} },
                    methods: { ${Object.keys(metds).map(key => key + metds[key] + ' ')} }
                }${'</'}script>`, {
                parser: 'vue',
                plugins: [parserHtml, parserBabel],
                "arrowParens": "always",
                "bracketSameLine": false,
                "bracketSpacing": true,
                "embeddedLanguageFormatting": "auto",
                "htmlWhitespaceSensitivity": "css",
                "insertPragma": false,
                "jsxSingleQuote": false,
                "printWidth": 80,
                "proseWrap": "preserve",
                "quoteProps": "as-needed",
                "requirePragma": false,
                "semi": true,
                "singleQuote": false,
                "tabWidth": 2,
                "trailingComma": "es5",
                "useTabs": false,
                "vueIndentScriptAndStyle": false
            }).replace(/\n/g, '\\n').replace(/</g, '&lt;');
            event.args.initialData.code = 
            '<!DOCTYPE html>' +
            '<html>' +
            '<head>' +
            '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
            '<meta name="viewport" content="width=device-width,initial-scale=1.0">' +
            '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.3.1/build/styles/atom-one-dark.min.css">' +
            '<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.3.1/build/highlight.min.js"><' +'/script>' +
            '<script src="https://cdn.jsdelivr.net/npm/vue@2"><' + '/script>' +
            '<style>' +
            `  html,body {
                    height: calc(100% - 21px);
                }
                #intro,pre,pre > code {
                    height: 100%;
                }
                pre > code {
                    white-space: pre;
                    font-family: 'Courier New';
                    font-size: 13px;
                    border: 1px solid #d7c9c9;
                    padding: 2px;
                    overflow: auto;
                }` +
            '</style>' +
            '</head>' +
            '<body id="tinymce" class="mce-content-body ">' +
            '<div id="intro">' + 
            '<pre><code class="language-html" v-html="text" /></pre>' +
            '</div>' +
            '<script type="text/javascript">' +
            `   (function() {
                    new Vue({
                        el: '#intro',
                        data: {
                            text: \`${html}\`
                        },
                        mounted() {
                            const el = this.$el.querySelector('pre code');
                            hljs.highlightElement(el);
                        }
                    });
                })()` +
            '<' + '/script>' +
            '</body>' +
            '</html>';
        }
    });
}

function g_syncLoading(self, callback) {
    const timer = setInterval(() => {
        if (!self.loading) {
            clearInterval(timer);
            callback();
        }
    }, 500);
}

function g_resolve(ctx, editor) {
    return window['tinyMCE'].resolve(ctx, editor);
}

function g_activeEditor() {
    return window['tinyMCE'].activeEditor;
}

function g_hasKey(obj, key) {
    return Object.keys(obj).includes(key);
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