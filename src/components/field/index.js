const mixins = () => ({
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
        },
        'options.printMode': {
            immediate: true,
            handler(n) {
                if (!n && this.options.nobor) {
                    this.$nextTick(() => {
                        this.$el.children[0].style.border = '0px';
                        this.$el.children[0].style['box-shadow'] = 'unset';
                    })
                }
            }
        }
    }
});

const styles = (options) => {
    return { width: '200px', margin: '0 2px' };
};

// 预览时存在缓存该组件，所以使用函数每次预览返回一个新的
export function inputMaker() {
    return {
        mixins: [mixins()],
        render() {
            const style = styles(this.options);
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata}</div>) :
                (<a-input allowClear onBlur={$blur(this, this.$listeners.blur)} style={style} size="small" v-model={this.mdata} />);
        }
    }
}

export function textareaMaker() {
    return {
        mixins: [mixins()],
        render() {
            const style = styles(this.options);
            style['vertical-align'] = 'top';
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata?.split(/[\s\n]/).map(it => <div>{it}</div>)}</div>) :
                (<a-textarea allowClear onBlur={$blur(this, this.$listeners.blur)} style={style} size="small" v-model={this.mdata} />);
        }
    }
}

export function selectMaker() {
    return {
        mixins: [mixins()],
        render() {
            const style = styles(this.options);
            const list = this.options.options?.split(',');
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block' }}>{list[this.mdata]}</div>) :
                (<a-select allowClear onBlur={$blur(this, this.$listeners.blur)} style={style} size="small" v-model={this.mdata}>
                    {list.map((val, idx) => (<a-select-option value={idx}>{val}</a-select-option>))}
                </a-select>);
        }
    }
}

export function dateMaker() {
    return {
        mixins: [mixins()],
        render() {
            const style = styles(this.options);
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata.format(this.options.format || 'YYYY-MM-DD')}</div>) :
                (<a-date-picker onBlur={$blur(this, this.$listeners.blur)} style={style} size="small" allowClear v-model={this.mdata} format={this.options.format || 'YYYY-MM-DD'} />);
        }
    }
}

export function dialogMaker() {
    return {
        mixins: [mixins()],
        render() {
            const style = styles(this.options);
            return this.options.printMode ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata}</div>) :
                (<a-input-search readOnly onBlur={$blur(this, this.$listeners.blur)} style={style} size="small" allowClear onSearch={() => {
                    alert('还没有实现哦~')
                }} />);
        }
    }
}

const Fn = () => { }
function $blur(vm, cb) {
    var old = null;
    return function (e) {
        if (old != vm.mdata) {
            old = vm.mdata;
            (cb || Fn)(e);
        }
    }
}