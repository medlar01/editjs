export default [
    function (vm, event, ctx) { // 转换field
        ctx['data'] = {};
        ctx['body'] = event.target.dom.create('body', {}, event.content);
        const DOMUtils = event.target.resolve('tinymce.dom.DOMUtils');
        const blocks = DOMUtils.DOM.$('.mce-field', ctx['body']);
        if (!ctx['data'].formData) {
            ctx['data'].formData = {};
        }
        blocks.each(function (idx, n) {
            const input = event.target.dom.create('input', { class: 'mce-field', id: n.id, 'v-model': `formData.${n.id}` });
            (n.parentElement || n.parentNode).replaceChild(input, n);
            ctx['data'].formData[n.id] = null;
        });
    },

    function (vm, event, ctx) { // 转换table line
        const DOMUtils = event.target.resolve('tinymce.dom.DOMUtils');
        const blocks = DOMUtils.DOM.$('.mce-table-line', ctx['body']);
        blocks.each(function (idx, n) {
            const div = event.target.dom.create('div', {}, n.innerHTML);
            (n.parentElement || n.parentNode).replaceChild(div, n);
        });
    },

    function(vm, event, ctx) { // 事件集成
        const events = vm.events;
        const mtds = ctx['methods'] = {};
        events.forEach(evt => {
            const evts = {};
            objEach(evt.events, (ev, key) => {
                (evts[ev.type] = evts[ev.type] || []).push(key + '()');
                mtds[key] =  `() { ${conv(ev)} }`;
            });
            const block = ctx['body'].querySelector('#' + evt.field.id);
            objEach(evts, (el, key) => {
                block.setAttribute(`v-on:${key}`, `() => { ${el.join(';')} }`);
            });
        });
        console.log('vm.events', vm.events, ctx);
    }
]

function objEach(obj, callback) {
    Object.keys(obj).forEach(_ => callback(obj[_], _));
}

function conv(ev) {
    console.log('conv', ev);
    switch(ev.bus) {
        case 'default': {
            return ev.action.map(it => `this.formData.${it.id} = ${it.exec}`)
            // return `this.formData.l1j47al23q1j = 'Hello'`;
        }
    }
}