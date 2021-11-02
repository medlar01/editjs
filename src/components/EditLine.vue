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
                            <a-tree-node :disabled="f.disabled" v-for="(f, idx) in data.main.fields" :selectable="false" :key="'field-' + idx" :title="f.comment + '/' + f.name.toUpperCase()" @dblclick.native="insertField(f)" />
                        </a-tree-node>
                    </a-tree>
                    <a-icon slot="extra" type="setting" />
                </a-collapse-panel>
            </a-collapse>
        </a-layout-sider>
        <a-layout-content>
            <Tinymce lang="zh_CN" ref="tmceInstance" :config="config" :plugins="plugins" :field-info="data" @init-event="$emit('init-event')" is-line :value="value" />
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
        plugins: {
            type: Array,
            default() {
                return []
            }
        },
        actTab: [String, Number],
        tabIndex: [String, Number]
    },

    data() {
        return {
            height: 0,
            value: '',
            config: {}
        }
    },

    watch: {
        'actTab': function (n, o) {
            if (n != o && n == this.tabIndex) {
                this.$refs.tmceInstance.reload();
            }
        }
    },

    created() {
        const vm = this;
        this.config['setup'] = function(editor) {
            const plugins = [...vm.plugins, g_plugin];
            for (let index = 0; index < plugins.length; index++) {
                const plugin = plugins[index];
                plugin(vm, editor);
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
        insertField(metadata) {
            if (metadata.disabled) return;
            const { tmceInstance } = this.$refs;
            const selection = tmceInstance.getSelection();
            const element = selection.getNode();
            if (element.nodeName != 'TD') {
                const edi = tmceInstance.getEditor();
                edi.notificationManager.open({text: '请在表格第' + g_findFieldRow(element) + '行内插入数据键', type: 'error'});
                return;
            }
            const parent = element.parentElement || element.parentNode;
            if (!(parent && parent.classList.contains('line_field_row'))) {
                const edi = tmceInstance.getEditor();
                edi.notificationManager.open({text: '请在表格第' + g_findFieldRow(element) + '行内插入数据键', type: 'error'});
                return;
            }
            const { DOM } = g_resolve('tinymce.dom.DOMUtils');
            const htmlField = DOM.create('span', { class: 'unedit mce-field', id: metadata.id }, metadata.comment + '/' + metadata.name.toUpperCase());
            tmceInstance.insertElement(htmlField);
            metadata.disabled = true;
            tmceInstance.focus();
        },

        setContent(ctx) {
            const { tmceInstance } = this.$refs;
            tmceInstance.setContent(ctx);
        },

        save() {
            const { tmceInstance } = this.$refs;
            return {
                metadata: this.data.main,
                ctx: tmceInstance.getContent()
            };
        },
        
        distory() {
            const { tmceInstance } = this.$refs;
            tmceInstance.distory();
        },
    }
}

function g_resolve(ctx, editor) {
    return window['tinyMCE'].resolve(ctx, editor);
}

function findParent(element, name) {
    if (element && element.nodeName == name) {
        return element;
    }
    while (element != null && element.nodeName != name && element.nodeName != 'BODY') {
        element = element.parentElement || element.parentNode;
    }
    return element ? element.nodeName == name ? element : null : null;
}

function g_findFieldRow(element) {
    element = findParent(element, 'TABLE');
    let row = 0;
    if (!element) {
        return -1;
    }
    const trs = element.querySelectorAll('tr');
    for (const key in trs) {
        const tr = trs[key];
        row ++;
        if (tr.classList && tr.classList.contains('line_field_row')) {
            return row;
        }
    }
    return -1;
}

function g_plugin(vm, editor) {
    editor.on('load', function() {
        if (editor.hasPlugin('table')) {
            const cached = g_regConfig(editor);
            const keys = ['tabledeleterow', 'tablecutrow', 'tablecopyrow'];
            g_rewriteMenuItem(cached.menuItems, keys, function(overwrite, api) {
                const { tmceInstance } = vm.$refs;
                const selection = tmceInstance.getSelection();
                let element = selection.getNode();
                element = findParent(element, 'TD');
                if (!element) {
                    overwrite(api);
                    return;
                }
                if (element.hasAttribute('data-mce-selected')) {
                    api.setDisabled(true);
                    return;
                }
                const parent = element.parentElement || element.parentNode;
                if (!(parent && parent.classList.contains('line_field_row'))) {
                    overwrite(api);
                    return;
                }
                api.setDisabled(true);
            });
        }
    });

    function changeEvents(edr, bindings, removed) {
        for (let index = 0; index < bindings.length; index++) {
            const binding = bindings[index];
            const events = edr.bindings[binding];

            for (let index = 0; index < events.length; index++) {
                const event = events[index];
                event.removed = removed;
            }
        }
    }

    editor.on('ObjectSelected', function() {
        setTimeout(function() {
            const node = editor.selection.getNode();
            const removed = containClass(node, 'mce-field');
            changeEvents(editor.getEventDispatcher(), ['mousemove'], removed);
        });
    });

    // editor.on('Winopen', function(event) {
    //     console.log("winopen", event);
    //     if (event.args.title == 'Row Properties') {
    //         const tds = event.target.dom.$('.line_field_row td[data-mce-selected]');
    //         event.args.body.tabs[0].items[0].disabled = tds.length > 0;
    //     }
    // });
}

function g_regConfig(edi) {
    return edi.ui.registry.getAll();
}

function g_rewriteMenuItem(menuItems, keys, callback) {
    if (keys && typeof keys == 'string') {
        keys = [keys];
    }
    keys.map(key => {
        if (menuItems[key]) {
            const overwrite = menuItems[key].onSetup;
            menuItems[key].onSetup = function(api) {
                callback(overwrite, api);
            }
        }
    });
}

function containClass(node, clazz) {
    return (node&& node.classList && node.classList.contains(clazz));
}
</script>

<style>
</style>