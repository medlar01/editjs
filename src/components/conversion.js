export default [
    function (vm, event, ctx) { // 转换field
        ctx['data'] = {};
        ctx['body'] = event.target.dom.create('body', {}, event.content);
        const DOMUtils = event.target.resolve('tinymce.dom.DOMUtils');
        const fieldNodes = DOMUtils.DOM.$('.mce-field', ctx['body']);
        fieldNodes.each(function (idx, n) {
            const input = event.target.dom.create('input', { class: 'mce-field', id: n.id, 'v-model': n.id });
            (n.parentElement || n.parentNode).replaceChild(input, n);
            ctx['data'][n.id] = null;
        });
    },

    function (vm, event, ctx) { // 转换table line
        const DOMUtils = event.target.resolve('tinymce.dom.DOMUtils');
        const tableNodes = DOMUtils.DOM.$('.mce-table-line', ctx['body']);
        tableNodes.each(function (idx, n) {
            const div = event.target.dom.create('div', {}, n.innerHTML);
            (n.parentElement || n.parentNode).replaceChild(div, n);
        });
    }
]