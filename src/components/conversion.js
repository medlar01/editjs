export default [
    function (vm, editor, content, ctx) { // 转换field
        editor.StyleUtils = new editor.editorManager.resolve('tinymce.html.Styles')({})
        ctx['data'] = {
            cached: null
        };
        ctx['props'] = {
            printMode: {
                type: 'Boolean',
                default: false
            }
        };
        ctx['body'] = editor.dom.create('body', {});
        const form = editor.dom.create('a-form', {}, content);
        ctx['body'].appendChild(form);
        const DOMUtils = editor.resolve('tinymce.dom.DOMUtils');
        const blocks = DOMUtils.DOM.$('.mce-field', ctx['body']);
        if (!ctx['data'].form) ctx['data'].form = {};

        const cacheFields = {};
        [...vm.data.main.fields, ...[].concat(...vm.data.lines.map(it => it.fields),
            ...vm.data.lines.map(it => ({ id: it.id, comment: it.table_comment, name: it.table_name })))]
            .forEach(it => cacheFields[it.id] = it);
        ctx['cacheFields'] = cacheFields;
        blocks.each(function (idx, n) {
            const style = editor.StyleUtils.parse(n.getAttribute('style'));
            const field = cacheFields[n.id];
            const opt = { 
                printMode: 'printMode',
                hidden: n.children[0].classList.contains('iconhidden-l'),
                readonly: n.children[0].classList.contains('iconread-only'),
                nobor: (n.getAttribute('mce-nobor') == 'true' || false),
                required: (n.getAttribute('mce-required') == 'true' || false),
                width: style.width
            };
            if (field.category == 'select') {
                opt['options'] = field.options;
            }
            if (field.category == 'dialog') {
                opt['options'] = {
                    dialog: field.options,
                }
            }
            if (field.category == 'date') {
                opt['format'] = field.format;
            }

            const optionString = JSON.stringify(opt, null, 4)
                .replace(/"printMode": "([^"]+)"/g, 'printMode: $1');
            if (!n.classList.contains('tl')) {
                const input = editor.dom.create('f-' + field.category, { id: n.id, ref: n.id, 'v-model': `form.${field.name}`, ':options': optionString });
                (n.parentElement || n.parentNode).replaceChild(input, n);
                ctx['data'].form[field.name] = null;
            } else {
                const input = editor.dom.create('f-' + field.category, { ':id': `'${n.id}_' + idx`, ':ref': `'${n.id}-' + idx`, ':idx': 'idx', 'v-model': `item.${field.name}`, ':options': optionString });
                (n.parentElement || n.parentNode).replaceChild(input, n);
            }
        });
    },

    function (vm, editor, content, ctx) { // 转换table line
        const DOMUtils = editor.resolve('tinymce.dom.DOMUtils');
        const blocks = DOMUtils.DOM.$('.mce-table-line', ctx['body']);
        const cacheFields = ctx['cacheFields'];
        blocks.each(function (idx, n) {
            const field = cacheFields[n.id];
            const table = n.querySelector('table');
            table.id = n.id;
            const tr = table.querySelector('tr.line_field_row');
            tr.setAttribute('v-for', `(item, idx) in form.${field.name}`);
            tr.setAttribute(':key', `idx`);
            ctx['data'].form[field.name] = [];
            const div = editor.dom.create('div', {}, n.innerHTML);
            const gbtm = editor.dom.create('span', {'v-show': '!printMode', style: 'position: absolute; right: 8px; background-color: #e7e7e785'});
            const btm1 = editor.dom.create('a-icon', {type: 'plus', style: 'margin: 0 5px; color: green; cursor: pointer', 'v-on:click': `form.${field.name}.push({})`});
            const btm2 = editor.dom.create('a-icon', {type: 'minus', style: 'margin: 0 5px; color: red; cursor: pointer', 'v-on:click': `(e) => {
                const data = this.form.${field.name};
                for(let i = data.length - 1; i >= 0; i--) {
                    if (data[i].checked) {
                        data.splice(i, 1);
                    }
                }
            }`});
            div.querySelectorAll('table tr > td.checkbox > input[type="checkbox"]').forEach((item, idx) => {
                item.setAttribute('v-model', 'item.checked');
            });
            gbtm.appendChild(btm2);
            gbtm.appendChild(btm1);
            div.querySelector('table tr > td:last-child')
                .appendChild(gbtm);
            const tbody = div.querySelector('table > tbody');
            tbody.setAttribute('v-show', `form.${field.name}.length > 0`);
            (n.parentElement || n.parentNode).replaceChild(div, n);
        });
    },

    function (vm, editor, content, ctx) { // 事件集成
        const events = vm.events;
        const mtds = ctx['methods'] = {
            'validation': `() {
                let flag = false
                Object.keys(this.$refs).forEach(key => {
                    const ref = Array.isArray(this.$refs[key]) ? this.$refs[key][0] : this.$refs[key]
                    if (ref.$v && ref.options.required) {
                        const result = ref.touch()
                        flag = flag || result
                    }
                })
                return flag
            }`
        };
        events.forEach(evt => {
            const evts = {};
            objEach(evt.events, (ev, key) => {
                const convString = conv(ctx, ev);
                if (convString) {
                    (evts[ev.type] = evts[ev.type] || []).push(key + '()');
                    mtds[key] = `() { ${convString} }`;
                }
            });
            const block = ctx['body'].querySelector('#' + evt.field.id);
            if (block) {
                objEach(evts, (el, key) => {
                    block.setAttribute(`v-on:${key}`, `() => { ${el.join(';')} }`);
                });
            }
        });
    }
]

function objEach(obj, callback) {
    Object.keys(obj).forEach(i => callback(obj[i], i));
}

function conv(ctx, ev) {
    const cache = ctx['cacheFields'];
    const formData = ctx['data'].formData;
    switch (ev.bus) {
        case 'default': {
            return ev.action.map(it => {
                if (!Object.keys(formData).includes(cache[it.id].name)) return null;
                return `this.form.${cache[it.id].name} = '${it.exec.value == null ? "" : it.exec.value}'`;
            }).join(';');
        }
        case 'script': {
            return ev.action.map(it => {
                switch (it.exec.type) {
                    case "script": {
                        return it.exec.value;
                    }
                    case "request": {
                        return `this.axios.${it.exec.method}('${it.exec.url || "get"}')
                            .then((res) => { ${it.exec.value} })
                        `
                    }
                    default: return null;
                }
            }).join(';');
        }
        default: return null;
    }
}