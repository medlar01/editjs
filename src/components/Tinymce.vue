<template>
    <textarea hidden :id="tinymceId" v-text="value" />
</template>

<script>
import plugin from './plugin'
export default {
    props: {
        block: {
            type: String,
            default: 'div'
        },
        tinymceId: {
            type: String,
            default() {
                return 'vue-tinymce-' + Date.now() + ((Math.random() * 1000).toFixed(0) + '')
            }
        },
        lang: {
            type: String,
            default: 'en'
        },
        value: {
            type: String,
            default: ''
        },
        fieldInfo: {
            type: Object
        },
        isLine: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            editor: null,
            ctx: '',
        }
    },

    created() {
        this.load('https://cdn.jsdelivr.net/gh/medlar01/tinymce-cdn@5.9.2.1/tinymce.js',
            (err) => {
                if (err) throw err;
                if (this.editor?.tinymce?.get(this.tinymceId)) {
                    this.destroy();
                }
                this.build();
            });
    },

    methods: {
        load(link, callback = (function () { })) {
            const id = '#vue-tinymce-5_9_2_0'
            let script = document.getElementById('#' + id);
            if (!script) {
                script = document.createElement('script');
                script.id = id;
                script.src = link;
                document.body.appendChild(script);
            }
            ('onload' in script ? stdOnEnd : ieOnEnd)()

            function stdOnEnd() {
                script.onload = function () {
                    this.onerror = this.onload = null
                    callback(null)
                }
                script.onerror = function () {
                    this.onerror = this.onload = null
                    callback(new Error('Failed to load ' + link))
                }
            }

            function ieOnEnd() {
                script.onreadystatechange = function () {
                    if (this.readyState !== 'complete' && this.readyState !== 'loaded') return
                    this.onreadystatechange = null
                    callback(null)
                }
            }
        },

        build() {
            const self = this;
            this.editor = null;
            window.tinymce.init({
                selector: '#' + this.tinymceId,
                language: this.lang,
                skin: 'oxide-x',
                height: '100%',
                menubar: false,
                toolbar_sticky: false,
                plugins: 'print preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking toc insertdatetime advlist lists imagetools textpattern noneditable help charmap quickbars emoticons',
                toolbar: 'undo redo | fullscreen  preview code | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | table | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | insertfile image media template link codesample | visualblocks ltr rtl',
                content_style: `
                    body { font-family:Helvetica,Arial,sans-serif; font-size:14px } 
                    .mce-content-body [contentEditable=false][data-mce-selected] { outline: 2px solid #b4d7ff; cursor: default }
                    .mce-visualblocks { min-width: calc(100% - 32px); width: fit-content }
                    .mce-field { display: inline-block; min-width: 200px; min-height: 20px; border: 1px solid grey; font-size: 12px;
                        line-height: 20px; padding: 0 2px; margin: 0 2px; -webkit-user-select:none; -moz-user-select:none;  -ms-user-select:none; user-select:none;
                        outline: 0px; border-radius: 0px
                    }
                    .mce-table-line { position: relative; display: block; padding-top: 15px; border: 1px solid #bbb; min-height: 20px; margin: 2px }
                    .mce-table-line::before { content: attr(title); position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index: 10; font-size: 10px; color: #666666 }
                `,
                table_clone_elements: 'strong em b i font h1 h2 h3 h4 h5 h6 p div',
                table_sizing_mode: 'fixed',
                noneditable_noneditable_class: 'unedit',
                quickbars_insert_toolbar: false,
                toolbar_mode: 'sliding',
                force_br_newlines: false,
                force_p_newlines: false,
                forced_root_block: self.block,
                visualblocks_default_state: true,
                resize: false,
                init_instance_callback(editor) {
                    plugin(self, editor);
                    editor.on('preview', (e) => self.$emit('preview', e));
                    self.$emit('init-event');
                    window.tinyMCE.setActive(editor);
                }
            });
        },

        rebuild() {
            this.distory();
            this.build();
        },

        distory() {
            this.editor.tinymce
                .get(this.tinymceId).destroy();
        },

        insertField(fieldMeta) {
            const { dom } = this.editor;
            const htmlField = dom.create('span', { class: 'unedit mce-field', id: fieldMeta.id }, fieldMeta.comment + '/' + fieldMeta.name.toUpperCase());
            this.editor.selection.setNode(htmlField);
            fieldMeta.disabled = true;
            this.editor.focus();
        },

        insertLineTable({meta, ctx}) {
            const editor = this.editor;
            function init() {
                const { dom } = editor;
                const htmlLineTable = dom.create('div', { class: 'unedit mce-table-line', title: meta.table_comment, id: meta.id });
                htmlLineTable.innerHTML = ctx || '';
                editor.selection.setNode(htmlLineTable);
                meta.disabled = true;
                editor.focus();
            }
            let lineTableBlock = editor.dom.$('#' + meta.id, editor.getDoc());
            if (lineTableBlock.length > 0) {
                lineTableBlock = lineTableBlock[0];
                lineTableBlock.innerHTML = ctx;
                this.ctx = editor.getContent();
                return;
            }
            init();
            this.ctx = editor.getContent();
        },

        insertContent(content) {
            this.editor.execCommand('mceInsertContent', false, content);
        },

        focus() {
            this.editor.focus();
        },

        getContent() {
            return this.editor.getContent();
        },

        setContent(ctx) {
            this.editor.setContent(ctx);
        },
    }
}
</script>

<style>
</style>