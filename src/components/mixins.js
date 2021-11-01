export default {
    methods: {
        getEditor() {
            return this.editor;
        },

        getSelection() {
            return this.editor.selection;
        },

        insertElement(target) {
            const selection = this.getSelection();
            selection.setNode(target);
        },

        insertContent(content) {
            this.getEditor()
                .execCommand('mceInsertContent', false, content);
        },

        focus() {
            this.getEditor()
                .focus();
        },

        getContent() {
            return this.getEditor()
                .getContent();
        },

        setContent(ctx) {
            this.getEditor()
                .setContent(ctx);
        },
    }
}