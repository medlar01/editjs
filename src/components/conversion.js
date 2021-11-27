export default [
    function (vm, event, ctx) { // 转换field
        event.target.StyleUtils = new event.target.editorManager.resolve('tinymce.html.Styles')({})
        ctx['data'] = {};
        ctx['props'] = {
            printMode: {
                type: 'Boolean',
                default: false
            }
        };
        ctx['body'] = event.target.dom.create('body', {}, event.content);
        const DOMUtils = event.target.resolve('tinymce.dom.DOMUtils');
        const blocks = DOMUtils.DOM.$('.mce-field', ctx['body']);
        if (!ctx['data'].formData) ctx['data'].formData = {};

        const cacheFields = {};
        [...vm.data.main.fields, ...[].concat(...vm.data.lines.map(it => it.fields),
            ...vm.data.lines.map(it => ({ id: it.id, comment: it.table_comment, name: it.table_name })))]
            .forEach(it => cacheFields[it.id] = it);
        ctx['cacheFields'] = cacheFields;
        blocks.each(function (idx, n) {
            const style = event.target.StyleUtils.parse(n.getAttribute('style'));
            const field = cacheFields[n.id];
            const opt = { 
                printMode: 'printMode',
                hidden: n.children[0].classList.contains('iconhidden-l'),
                readonly: n.children[0].classList.contains('iconread-only'),
                nobor: (n.getAttribute('mce-nobor') == 'true' || false),
                width: style.width
            };
            if (field.category == 'select') {
                opt['options'] = field.options;
            }
            if (field.category == 'date') {
                opt['format'] = field.format;
            }

            const optionString = JSON.stringify(opt, null, 4)
                .replace(/"printMode": "([^"]+)"/g, 'printMode: $1');
            if (!n.classList.contains('tl')) {
                const input = event.target.dom.create('f-' + field.category, { id: n.id, 'v-model': `formData.${field.name}`, ':options': optionString });
                (n.parentElement || n.parentNode).replaceChild(input, n);
                ctx['data'].formData[field.name] = null;
            } else {
                const input = event.target.dom.create('f-' + field.category, { ':id': `'${n.id}_' + idx`, 'v-model': `item.${field.name}`, ':options': optionString });
                (n.parentElement || n.parentNode).replaceChild(input, n);
            }
        });
    },

    function (vm, event, ctx) { // 转换table line
        const DOMUtils = event.target.resolve('tinymce.dom.DOMUtils');
        const blocks = DOMUtils.DOM.$('.mce-table-line', ctx['body']);
        const cacheFields = ctx['cacheFields'];
        blocks.each(function (idx, n) {
            const table = n.querySelector('table');
            table.id = n.id;
            const tr = table.querySelector('tr.line_field_row');
            tr.setAttribute('v-for', `(item, idx) in formData.${cacheFields[n.id].name}`);
            tr.setAttribute(':key', `idx`);
            ctx['data'].formData[cacheFields[n.id].name] = [{}];
            const div = event.target.dom.create('div', {}, n.innerHTML);
            (n.parentElement || n.parentNode).replaceChild(div, n);
        });
    },

    function (vm, event, ctx) { // 事件集成
        const events = vm.events;
        const mtds = ctx['methods'] = {};
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
                return `this.formData.${cache[it.id].name} = '${it.exec.value == null ? "" : it.exec.value}'`;
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