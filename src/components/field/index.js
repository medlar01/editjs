const Fn = () => { }
// 预览时存在缓存该组件，所以使用函数每次预览返回一个新的
export function input() {
    return {
        props: ['value', 'options'],
        model: {
            prop: 'value',
            event: 'change'
        },
        data() {
            return {
                mdata: null
            }
        },
        watch: {
            value: {
                immediate: true,
                handler(n) {
                    this.mdata = n;
                }
            },
            mdata(n) {
                this.$emit('change', n);
            }
        },
        render() {
            const style = {
                width: '200px'
            };
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block', 'vertical-align': 'top' }}>{this.mdata}</div>) :
                (<a-input onBlur={this.$listeners.blur || Fn} style={style} size="small" v-model={this.mdata} />);
        }
    }
}

export function textarea() {
    return {
        props: ['value', 'options'],
        model: {
            prop: 'value',
            event: 'change'
        },
        data() {
            return {
                mdata: null
            }
        },
        watch: {
            value: {
                immediate: true,
                handler(n) {
                    this.mdata = n;
                }
            },
            mdata(n) {
                this.$emit('change', n);
            }
        },
        render() {
            const style = {
                width: '200px',
                'vertical-align': 'top'
            };
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata}</div>) :
                (<a-textarea onBlur={this.$listeners.blur || Fn} style={style} size="small" v-model={this.mdata} />);
        }
    }
}

export function select() {
    return {
        props: ['value', 'options'],
        model: {
            prop: 'value',
            event: 'change'
        },
        data() {
            return {
                mdata: null
            }
        },
        watch: {
            value: {
                immediate: true,
                handler(n) {
                    this.mdata = n;
                }
            },
            mdata(n) {
                this.$emit('change', n);
            }
        },
        render() {
            const style = {
                width: '200px',
                'vertical-align': 'top'
            };
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata}</div>) :
                (<a-select onBlur={this.$listeners.blur || Fn} style={style} size="small" v-model={this.mdata} />);
        }
    }
}

export function date() {
    return {
        props: ['value', 'options'],
        model: {
            prop: 'value',
            event: 'change'
        },
        data() {
            return {
                mdata: null
            }
        },
        watch: {
            value: {
                immediate: true,
                handler(n) {
                    this.mdata = n||'';
                }
            },
            mdata(n) {
                this.$emit('change', n);
            }
        },
        render() {
            const style = {
                width: '200px',
                'vertical-align': 'top'
            };
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata.format('YYYY-MM-DD')}</div>) :
                (<a-date-picker onBlur={this.$listeners.blur || Fn} style={style} size="small" v-model={this.mdata} format="YYYY-MM-DD"/>);
        }
    }
}