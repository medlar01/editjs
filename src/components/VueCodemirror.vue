<template>
    <codemirror class="vue-codemirror"
        v-model="innerCode"
        :options="options"
        @ready="(cm) => this.$emit('ready', cm)"
        @cursorActivity="(cm) => this.$emit('cursorActivity', cm)"
        @focus="(cm) => this.$emit('focus', cm)"
        @blur="(cm) => this.$emit('blur', cm)"
    />
</template>
<script>
import { codemirror } from "vue-codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/vue/vue.js";
import "codemirror/addon/selection/active-line.js";
import "codemirror/addon/selection/mark-selection.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/scroll/annotatescrollbar.js";
import "codemirror/addon/search/matchesonscrollbar.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/match-highlighter.js";
import "codemirror/mode/clike/clike.js";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/comment/comment.js";
import "codemirror/addon/dialog/dialog.js";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/search.js";
import "codemirror/keymap/sublime.js";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/indent-fold.js";
import "codemirror/addon/fold/markdown-fold.js";
import "codemirror/addon/fold/xml-fold.js";

export default {
    components: {
        codemirror,
    },
    model: {
        prop: "code",
        event: "change",
    },
    props: {
        code: String,
        options: {
            type: Object,
            default() {
                return {
                    tabSize: 4,
                    foldGutter: true,
                    styleActiveLine: true,
                    lineNumbers: true,
                    line: true,
                    keyMap: "sublime",
                    mode: "text/javascript",
                    theme: "monokai",
                    extraKeys: {
                        F11(cm) {
                            cm.setOption(
                                "fullScreen",
                                !cm.getOption("fullScreen")
                            );
                        },
                        Esc(cm) {
                            if (cm.getOption("fullScreen"))
                                cm.setOption("fullScreen", false);
                        },
                    },
                };
            },
        },
    },
    data() {
        return {
            innerCode: "",
        };
    },
    watch: {
        code: {
            handler(n, o) {
                this.innerCode = n;
            },
            immediate: true,
        },
        innerCode(n, o) {
            this.$emit("change", n);
        },
    },
};
</script>
<style>
.vue-codemirror > .CodeMirror {
    font-family: "Courier New";
    font-size: 12px;
}
</style>