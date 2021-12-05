import './load.css'
export default {
    props: {
        link: String,
        id: {
            type: String,
            default() {
                return 'edit-wrap-' + Date.now()
            }
        },
        printMode: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            load: null
        }
    },
    render() {
        if (this.load == null) {
            load(this.id, this.link, () => {
                this.load = window['lib']
            })
        }
        const EditLoad = this.load
        return (<div>
            {this.load ? (<EditLoad printMode={this.printMode} ref="load"/>): 'loading ....'}
        </div>)
    },
    methods: {
        validation() {
            return this.$refs.load.validation()
        },
        getData() {
            return this.$refs.load.form
        }
    },
    destroyed() {
        document.querySelector('#' + this.id).remove()
    }
}

function load(id, link, callback = function() { }) {
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