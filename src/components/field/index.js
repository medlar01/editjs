import axios from 'axios'

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
                        const child = this.$el.children[0];
                        if (child) {
                            child.style.border = '0px';
                            child.style['box-shadow'] = 'unset';
                        }
                    });
                }
            }
        }
    },
    methods: {
        getValue() {
            return this.mdata
        }
    }
});

const styles = (options) => {
    return { width: options.width, margin: '0 2px' };
};

// 预览时存在缓存该组件，所以使用函数每次预览返回一个新的
export function inputMaker() {
    return {
        mixins: [mixins()],
        render() {
            const style = styles(this.options);
            return this.options.printMode || this.options.readonly ?
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
            return this.options.printMode || this.options.readonly ?
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
            const list = this.options.options?.split(',') || [];
            return this.options.printMode || this.options.readonly ?
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
            return this.options.printMode || this.options.readonly ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata?.format(this.options.format || 'YYYY-MM-DD')}</div>) :
                (<a-date-picker onBlur={$blur(this, this.$listeners.blur)} style={style} size="small" allowClear v-model={this.mdata} format={this.options.format || 'YYYY-MM-DD'} />);
        }
    }
}

function searchModalMaker() {
    return {
        props: ['id', 'idx', 'visible'],
        model: {
            event: 'change',
            prop: 'visible'
        },
        inject: ['vm'],
        data() {
            return {
                code: null,
                name: null,
                data: [],
                page: {
                    current: 1,
                    pageSize: 5
                },
                option: {}
            }
        },
        render() {
            return (<a-modal title="弹窗选项" visible={this.visible} onCancel={() => this.$emit('change', false)} onOk={this.ok} bodyStyle={{padding: '0'}} footer={null}>
                <div>
                    <div style="text-align: right; padding: 2px 10px 2px; background-color: #fafafa">
                        <a-input v-model={this.code} placeholder="编码" size="small" style="width: 120px; margin: 0 5px"/>
                        <a-input v-model={this.name} placeholder="名称" size="small" style="width: 120px; margin: 0 5px"/>
                        <a-button icon="search" type="dashed" shape="round" size="small" onClick={() => {
                            this.page.current = 1;
                            this.search(this.page);
                        }}/>
                    </div>
                    <a-table row-key="code" data-source={this.data} size="middle" pagination={this.page} onChange={this.search}
                    customRow={(record) => ({ on: {
                        dblclick: () => {
                            this.$emit('select', record)
                            this.$emit('change', false)
                        }
                    }})}
                    columns={[
                        {
                            dataIndex: 'code',
                            title: '编码',
                            width: '30%',
                            align: 'center'
                        }, {
                            dataIndex: 'name',
                            title: '名称',
                            width: '30%',
                            align: 'center'
                        }, {
                            dataIndex: 'desc',
                            title: '描述',
                            width: '40%',
                            align: 'center'
                        }
                    ]}/>
                </div>
            </a-modal>);
        },
        created() {
            axios.post(`/editjs/dialog-info/${this.id}`).then(res => {
                if (res.status == 200) {
                    this.option = res.data
                }
            }).then(() => this.search(this.page));
        },
        methods: {
            search(pagination) {
                const { type, api, sql } = this.option;
                if (type == 'api') {
                    execApi.bind(this, api, pagination)()
                } else {
                    execSql.bind(this, sql, pagination)()
                }
            }
        }
    }
}

export function dialogMaker() {
    return {
        mixins: [mixins()],
        data() {
            return { visible: false }
        },
        inject: ['vm'],
        render() {
            const style = styles(this.options);
            const SearchModal = searchModalMaker();
            return this.options.printMode || this.options.readonly ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata}</div>) :
                (<span>
                    <a-input-search v-model={this.mdata} readOnly onBlur={$blur(this, this.$listeners.blur)} style={style} size="small" allowClear onSearch={() => this.visible = true } />
                    {this.visible ? (<SearchModal id={this.options.options.dialog.id} idx={this.$attrs.idx} v-model={this.visible} onSelect={(record) => {
                        this.vm.cached = record
                        this.mdata = record.code
                     }}/>) : null}
                </span>);
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

function execApi(api, pagination) {
    const conv = (params, vm) => {
        const data = {}
        params.map(param => {
            if (/^[$].+[$]$/.test(param.value)) {
                let value = param.value.substr(1, param.value.length - 2)
                if (value.endsWith("[idx]")) {
                    value = value.replace(/\[idx\]$/, this.idx)
                }
                const ref = vm.$refs[value]
                data[param.key] = Array.isArray(ref) ? ref[0].mdata : ref.mdata
            } else {
                data[param.key] = param.value
            }
        })
        return api.method == 'get' ? { params: data } : data
    }
    let config = (api.config||"")
        .replace(/(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g, '\n')
        .replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g, '\n')
        .replace(/\n/g, '')
    config = eval(`() => { return ${config} }`)()
    axios[api.method](api.url, {...conv(api.params,  this.vm), searchCode: this.code, searchName: this.name, ...pagination}, config).then(res => {
        if (res.status == 200) {
            const page = {...pagination}
            page.total = res.data.total
            this.data = res.data.list
            this.page = page
        }
    })
}

function execSql(sql, pagination) {
    // 解析参数
    const list = sql.match(/[$][^$]+[$]/g)
    const params = list.map(it => {
        let result = ""
        let value = it.substr(1, it.length - 2)
        let leftLike = false
        let rightLike = false
        if (value.startsWith('%')) {
            leftLike = true
            value = value.substr(1)
        }
        if (value.endsWith('%')) {
            rightLike = true
            value = value.substr(0, value.length - 1)
        }
        if (value.endsWith("[idx]")) {
            value = value.replace(/\[idx\]$/, this.idx)
        }
        const ref = this.vm.$refs[value]
        if (ref) {
            result = Array.isArray(ref) ? ref[0].mdata : ref.mdata
        } else {
            switch(value) {
                case "searchCode": {
                    result = (leftLike ? '%': '') + (this.code||'') + (rightLike ? '%': '')
                    break
                }
                case "searchName": {
                    result = (leftLike ? '%': '') + (this.name||'') + (rightLike ? '%': '')
                    break
                }
            }
        }
        return result
    }).join(' , ')
    console.log("sql", sql, params);
    axios.post(`/editjs/execSql/${this.id}`, {params, ...pagination}).then(res => {
        if (res.status == 200) {
            const page = {...pagination}
            page.total = res.data.total
            this.data = res.data.list
            this.page = page
        }
    })
}