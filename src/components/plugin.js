import { once } from '@/utils/common'

export default function (vm, editor) {
    if (vm.ctx) {
        editor.setContent(vm.ctx);
    }
    editor.tinymce = window.tinyMCE;
    editor.resolve = function (n, o) {
        return editor.tinymce.util.Tools.resolve(n, o);
    }
    editor.getEventDispatcher = function () {
        return this._eventDispatcher;
    }
    editor.on('NodeChange Change KeyUp KeyDown SetContent', function () {
        vm.ctx = editor.getContent();
        availableField(vm, (s) => editor.dom.$(s, editor.getBody()));
    });
    editor.on('undo', function () {
        vm.ctx = editor.getContent();
        availableField(vm, (s) => editor.dom.$(s, editor.getBody()));
    });
    const timer = setInterval(() => {
        if (editor.settings.destroy) {
            clearInterval(timer);
            return;
        }
        availableField(vm, (s) => editor.dom?.$(s, editor.getBody()));
    }, 1000);

    editor.on('Cut Copy', function (e) {
        const selection = editor.selection;
        const content = selection.getContent();
        if (/[^a-zA-Z]+mce-field[^a-zA-Z]+/.test(content)) {
            e.preventDefault();
            editor.notificationManager.open({ text: '【数据源/组件库】不可剪切、复制!', type: 'error' });
            return
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

    editor.on('ObjectSelected', function () {
        setTimeout(function () {
            const node = editor.selection.getNode();
            const removed = containClass(node, 'mce-table-line');
            changeEvents(editor.getEventDispatcher(), ['mousemove'], removed);
        });
    });

    editor.on('dblclick', function (e) {
        if (containClass(e.target, 'mce-table-line')) {
            const localField = vm.data.lines?.find(f => f.id == e.target.id);
            if (localField && vm.editLineTable) {
                vm.editLineTable(e, localField);
            }
        }
    });

    editor.on('BeforeExecCommand', function (event) {
        event.target.settings.now_event_wait = event.command;
    });

    editor.on('GetContent', function (event) {
        if (event.target.settings.now_event_wait == 'mcePreview') {
            once('preview', 300, () => {
                const { content } = event.target.fire('preview', event);
                event.content = content;
            });
        }
    });

    // 重写tinymce的window open接口，以达到干预作用
    editor.on('load', function () {
        const open = editor.windowManager.open;
        editor.windowManager.open = function (args, params) {
            const event = editor.fire('Winopen', { command: 'winopen', args, params });
            console.log('winopn', event);
            return open(event.args, event.params);
        };

        // 明细表格拓展
        if (editor.hasPlugin('table')) {
            const isTableLine = (element) => {
                const list = element.querySelectorAll('.mce-table-line');
                for (let index = 0; index < list.length; index++) {
                    if (list[index].hasAttribute('data-mce-selected')) {
                        return false;
                    }
                }
                return true;
            }

            // 原始表格中存在明细表则不显示原始表格的浮动菜单
            overwiteContextToolbars(editor, 'table', function (oldCb) {
                return (element) => (oldCb(element) && isTableLine(element));
            });
        }
    });

    // 注册字段组件的菜单项
    editor.ui.registry.addToggleButton('fieldattr', {
        icon: 'preferences',
        tooltip: '编辑字段属性',
        onAction: makeFieldDialog(vm, editor)
    });
    editor.ui.registry.addToggleButton('fieldhidden', {
        icon: 'preview',
        tooltip: '设置字段不可见',
        onSetup: api => {
            const currNode = editor.selection.getNode();
            api.setDisabled(!(isField(currNode) && !currNode.children[0].classList?.contains('iconhidden-l')));
            currNode.hapi = api;
        },
        onAction: api => {
            const currNode = editor.selection.getNode();
            delClass(currNode.children[0]);
            addClass(currNode.children[0], ['iconfont', 'iconhidden-l']);
            api.setDisabled(true);
            const field = vm.data.main.fields.find(i => i.id == currNode.id);
            field.hidden = true;
            field.editable = true;
            currNode.rapi.setDisabled(false);
        }
    });
    editor.ui.registry.addToggleButton('fieldreadonly', {
        icon: 'permanent-pen',
        tooltip: '设置字段不可编辑',
        onSetup: api => {
            const currNode = editor.selection.getNode();
            api.setDisabled(!(isField(currNode) && !currNode.children[0].classList?.contains('iconread-only')));
            currNode.rapi = api;
        },
        onAction: api => {
            const currNode = editor.selection.getNode();
            delClass(currNode.children[0]);
            addClass(currNode.children[0], ['iconfont', 'iconread-only']);
            api.setDisabled(true);
            const field = vm.data.main.fields.find(i => i.id == currNode.id);
            field.hidden = false;
            field.editable = false;
            currNode.hapi.setDisabled(false);
        }
    })
    editor.ui.registry.addContextToolbar('field', {
        predicate: element => isField(element),
        items: 'fieldattr|fieldhidden|fieldreadonly',
        position: 'node',
        scope: 'node',
        type: 'contexttoolbar'
    })
}

let cachedElement = null;

function makeFieldDialog(vm, edi) {
    const pannelArgs = {
        title: '编辑字段属性',
        size: 'normal',
        body: {
            type: 'panel',
            items: [
                {
                    type: 'grid',
                    columns: 2,
                    items: [
                        { type: 'input', name: 'category', label: '类别', disabled: true }
                    ]
                },
                {
                    type: 'grid',
                    columns: 2,
                    items: [
                        { type: 'input', name: 'id', label: 'id' }
                    ]
                },
                {
                    type: 'grid',
                    columns: 2,
                    items: [
                        { type: 'input', name: 'width', label: 'width' }
                    ]
                },
                {
                    type: 'grid',
                    columns: 3,
                    items: [
                        { type: 'label', label: '无边框', items: [
                            { type: 'checkbox', name: 'nobor', label: '消除框边线' }
                        ]},
                        { type: 'label', label: '隐藏', items: [
                            { type: 'checkbox', name: 'hidden', label: '字段不可见' }
                        ]},
                        { type: 'label', label: '只读', items: [
                            { type: 'checkbox', name: 'readonly', label: '字段不可编辑' }
                        ]}
                    ]
                }
            ]
        },
        buttons: [
            { type: 'cancel', name: 'cancel', text: 'cancel' },
            { type: 'submit', name: 'save', text: 'save', primary: true }
        ],
        onSubmit: (api) => {
            const data = api.getData();
            cachedElement.style.width = data.width;
            cachedElement.setAttribute('data-mce-style', 'width: ' + data.width);
            delClass(cachedElement.children[0]);
            if (data.hidden) {
                addClass(cachedElement.children[0], ['iconfont', 'iconhidden-l']);
            } else 
            if (data.readonly) {
                addClass(cachedElement.children[0], ['iconfont', 'iconread-only']);
            } else {
                addClass(cachedElement.children[0], ['iconfont', 'iconedit']);
            }
            cachedElement.setAttribute('mce-nobor', data.nobor);
            api.close();
        }
    };
    return _ => {
        const currNode = edi.selection.getNode();
        if (!isField(currNode)) {
            return;
        }
        const field = vm.data.main.fields.find(i => i.id == currNode.id);
        const style = currNode.style;
        pannelArgs['title'] = `字段：${currNode.innerText}`
        pannelArgs['initialData'] = {
            id: field.id,
            width: style.width,
            category: field.category,
            hidden: currNode.children[0].classList.contains('iconhidden-l'),
            readonly: currNode.children[0].classList.contains('iconread-only'),
            nobor: (currNode.getAttribute('mce-nobor') == 'true' || false)
        };
        cachedElement = currNode;
        edi.windowManager.open(pannelArgs);
    }
}

function isField(el) {
    return el && el.nodeName == 'SPAN' && el.classList?.contains('mce-field');
}

function delClass(el, keys = '*') {
    if (typeof keys == 'string') {
        if (keys === '*') {
            keys = [];
            el.classList.forEach(it => keys.push(it));
        } else keys = [keys];
    }
    for (let index = keys.length - 1; index >= 0; index--) {
        el.classList?.remove(keys[index]);
    }
}

function addClass(el, keys = []) {
    keys.forEach(key => el.classList?.add(key));
}


function availableField(vm, $) {
    for (let index = 0, fields = [...vm.data.main.fields, ...(vm.data.lines || [])];
        index < fields.length; index++) {
        const field = fields[index];
        const disabled = !(field.id && $('#' + field.id)?.length == 0);
        field.disabled = disabled;
    }
}

function overwiteContextToolbars(edi, key, callback) {
    const { contextToolbars } = edi.ui.registry.getAll();
    const toolbar = contextToolbars[key];
    toolbar.predicate = callback(toolbar.predicate);
}


function containClass(node, clazz) {
    return (node && node.classList && node.classList.contains(clazz));
}

function isNumber(val) {
    if (val == null) return false;
    if (typeof val === 'number') return true;
    if (typeof val === 'string') {
        const regex = /^[0-9]+.?[0-9]*/;
        return regex.test(val);
    }
    return false;
}