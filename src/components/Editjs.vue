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
                <FormSetting :data="data" />
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
import Tinymce from './Tinymce.vue'
import EditLine from './EditLine.vue'
import FormSetting from './FormSetting.vue'
import BehaviorSetting from './behavior'
import ErdMaker from 'element-resize-detector'
import prettier from 'prettier'
import parserHtml from 'prettier/parser-html'
import parserBabel from 'prettier/parser-babel'
import { constTableTpl } from './config'
import plugin, { unique } from './plugin'
import conversions from './conversion'
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
        this.insidePlugins = this.insidePlugins.concat([...this.plugins, (_, edi) => edi.on('preview', (e) => vm.preview(e)), _plugin]);
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
                const { DOM } = _resolve('tinymce.dom.DOMUtils');
                const htmlField = DOM.create('span', { class: 'unedit mce-field', id: metadata.id }, metadata.comment + '/' + metadata.name.toUpperCase());
                tmceInstance.insertElement(htmlField);
                metadata.disabled = true;
                tmceInstance.focus();

            } else {
                this.openTab(metadata);
            }
        },

        insertLineTable(metadata, ctx) {
            const tmceInstance = this.$refs.tmceInstance;
            const { DOM } = _resolve('tinymce.dom.DOMUtils');
            let lineTableBlock = DOM.$('#' + metadata.id, _activeEditor().getDoc());
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
                        _syncLoading(this, () => {
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
            this.akey = 'tab-' + (4 + index);
            const self = this;
            _syncLoading(this, () => {
                const ref = self.$refs['editLine' + (4 + index)][0];
                ref.setContent(ctx || constTableTpl);
            });
        },

        preview(event) {
            const ctx = {};
            const conversions = this.conversions;
            const DOMUtils = event.target.resolve('tinymce.dom.DOMUtils');
            conversions.map(conversion => conversion(this, event, ctx));
            const content = ctx['body'].innerHTML;
            ctx['body'].innerHTML = '';
            const div = DOMUtils.DOM.create('div', {id: 'app'});
            ctx['body'].appendChild(div);
            const vue = DOMUtils.DOM.create('script', {src: 'https://cdn.jsdelivr.net/npm/vue@2'});
            const axios = DOMUtils.DOM.create('script', {src: 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js'});
            ctx['body'].appendChild(vue);
            ctx['body'].appendChild(axios);
            const metds = ctx['methods'];
            const script = DOMUtils.DOM.create('script', {type: "text/javascript"}, `
                (function() {
                    const win = window.parent;
                    const doc = win.document;
                    const page = doc.querySelector('div[role="dialog"] .tox-dialog__body-content');
                    page.style.height = '557px';
                    setInterval(() => {
                        page.style.height = '557px';
                    }, 500);

                    Vue.prototype.axios = axios;
                    const vue = new Vue({
                        el: '#app',
                        data: ${JSON.stringify(ctx['data'])},
                        template: \`<div>${content}</div>\`,
                        methods: {
                            ${Object.keys(metds).map(key => key + metds[key] + ' ')}
                        }
                    });
                    win.__preview__ = { vue };
                })();
            `);
            ctx['body'].appendChild(script);
            event.content = ctx['body'].innerHTML;
        }
    }
}

function _plugin(vm, edi) {
    edi.on('winopen', (event) => {
        if (event.args.title == 'Preview') {
            // 定制按钮
            event.content = edi.getBody().innerHTML;
            const { buttons } = event.args;
            buttons[0].primary = false;
            buttons.push({
                name: "获取数据",
                primary: true,
                text: "获取数据",
                type: "submit"
            });
            event.args.onSubmit = (api) => {
                alert(JSON.stringify(window['__preview__'].vue.$data.formData));
                api.close();
            }
            event.args.size = "large"

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
            const html = prettier.format(`<template>${content}</template><script>export default {data() { return ${JSON.stringify(ctx['data'], null, 4)} }, methods: { ${Object.keys(metds).map(key => key + metds[key] + ' ')} }}</` + 'script>', {
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

function _syncLoading(self, callback) {
    const timer = setInterval(() => {
        if (!self.loading) {
            clearInterval(timer);
            callback();
        }
    }, 500);
}

function _resolve(ctx, editor) {
    return window['tinyMCE'].resolve(ctx, editor);
}

function _activeEditor() {
    return window['tinyMCE'].activeEditor;
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