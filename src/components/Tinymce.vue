<template>
    <textarea hidden :id="tinymceId" v-text="value" />
</template>

<script>
import initMethod from './config'
import mixins from './mixins'
const _tinymce = () => window['tinyMCE'];
export default {
    props: {
        block: {
            type: String,
            default: 'div'
        },
        tinymceId: {
            type: String,
            default() {
                return 'vue-tinymce-' + Date.now() + ((Math.random() * 1000).toFixed(0) + '');
            }
        },
        config: {
            type: Object,
            default() {
                return {};
            }
        },
        value: {
            type: String,
            default: ''
        },
        plugins: {
            type: Array,
            default() {
                return []
            }
        },
    },

    data() {
        return {
            editor: null,
            ctx: '',
        }
    },
    mixins: [mixins],
    created() {
        _load('https://cdn.jsdelivr.net/gh/medlar01/tinymce-cdn@5.9.2.1/tinymce.js',
            (err) => {
                if (err) throw err;
                if (_tinymce().get(this.tinymceId)) {
                    this.destroy();
                }
                this.load();
            });
    },

    methods: {
        load() {
            const config = Object.assign(initMethod(this), this.config);
            _tinymce().init(config).then((args) => {
                this.editor = args[0];
                _tinymce().setActive(args[0]);
            });
        },

        reload() {
            this.distory();
            this.load();
        },

        distory() {
            (_tinymce().get(this.tinymceId) || this.editor).destroy();
        },
    }
}

function _load(link, callback = function() { }) {
    const id = '#vue-tinymce-5_9_2'
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
}
</script>

<style>
</style>