const Fn = () => { }
// 预览时存在缓存该组件，所以使用函数每次预览返回一个新的
export function inputMaker() {
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
            mdata(n, o) {
                if (n != o) {
                    this.$emit('change', n);
                }
            }
        },
        render() {
            const style = {
                width: '200px',
                margin: '0 2px',
            };
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata}</div>) :
                (<a-input onBlur={$blur(this, this.$listeners.blur)} style={style} size="small" v-model={this.mdata} />);
        }
    }
}

export function textareaMaker() {
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
            mdata(n, o) {
                if (n != o) {
                    this.$emit('change', n);
                }
            }
        },
        render() {
            const style = {
                width: '200px',
                margin: '0 2px',
                'vertical-align': 'top'
            };
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata?.split(/[\s\n]/).map(it => <div>{it}</div>)}</div>):
                (<a-textarea onBlur={$blur(this, this.$listeners.blur)} style={style} size="small" v-model={this.mdata} />);
        }
    }
}

export function selectMaker() {
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
            mdata(n, o) {
                if (n != o) {
                    this.$emit('change', n);
                }
            }
        },
        render() {
            const style = {
                width: '200px',
                margin: '0 2px',
            };
            const list = ['-'].concat(this.options.options?.split(',') || []);
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block' }}>{list[this.mdata]}</div>) :
                (<a-select onBlur={$blur(this, this.$listeners.blur)} style={style} size="small" v-model={this.mdata}>
                    {list.map((val, idx) => (<a-select-option value={idx}>{val}</a-select-option>))}
                </a-select>);
        }
    }
}

export function dateMaker() {
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
                    this.mdata = n || '';
                }
            },
            mdata(n, o) {
                if (n != o) {
                    this.$emit('change', n);
                }
            }
        },
        render() {
            const style = {
                width: '200px',
                margin: '0 2px',
            };
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata.format(this.options.format || 'YYYY-MM-DD')}</div>) :
                (<a-date-picker onBlur={$blur(this, this.$listeners.blur)} style={style} size="small" v-model={this.mdata} format={this.options.format || 'YYYY-MM-DD'} />);
        }
    }
}

export function dialogMaker() {
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
            mdata(n, o) {
                if (n != o) {
                    this.$emit('change', n);
                }
            }
        },
        render() {
            const style = {
                width: '200px',
                margin: '0 2px'
            };
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata}</div>) :
                (<a-input-search readOnly onBlur={$blur(this, this.$listeners.blur)} style={style} size="small" onSearch={() => {
                    alert('还没有实现哦~')
                }} />);
        }
    }
}

function $blur(vm, cb) {
    var old = null;
    return function (e) {
        if (old != vm.mdata) {
            old = vm.mdata;
            (cb || Fn)(e);
        }
    }
}