import axios from 'axios'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

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
                if (n?.format) {
                    this.$emit('change', n.format(this.options.format || 'YYYY-MM-DD'));
                } else {
                    this.$emit('change', n);
                }
            }
        },
        'options.printMode': {
            immediate: true,
            handler(n) {
                if (!n && this.options.nobor) {
                    this.$nextTick(() => {
                        if (this.$el.classList.contains('ant-input')) {
                            this.$el.style.border = '0px';
                            this.$el.style['box-shadow'] = 'unset';
                            this.$el.style['background-color'] = '#fff0';
                        }
                        const child = this.$el.querySelector('.ant-input') || this.$el.querySelector("div[role='combobox']");
                        if (child) {
                            child.style.border = '0px';
                            child.style['box-shadow'] = 'unset';
                            child.style['background-color'] = '#fff0';
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

const styles = (options, megex = {}) => {
    let margin = '0 8px'
    if (options.required) {
        margin = "0"
    }
    if (options.readonly) {
        margin = "0 20px"
    }
    if (options.printMode) {
        margin = null
    }
    return Object.assign({ width: options.width, margin }, megex);
};

// ?????????????????????????????????????????????????????????????????????????????????
export function inputMaker() {
    return {
        mixins: [mixins(), validationMixin],
        validations: {
            mdata: { required }
        },
        data() {
            return { error: false }
        },
        render() {
            const style = styles(this.options);
            return this.options.printMode || this.options.readonly ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata}</div>) :
                (<a-tooltip title="??????????????????!" placement="rightTop" visible={this.error} overlayStyle={{zIndex: 900}}>
                    <span>{this.options.required ? '???' : null}</span>
                    <a-input onBlur={$blur(this, this.$listeners.blur)} style={style} v-model={this.mdata} placeholder="?????????..." />
                </a-tooltip>);
        },
        methods: {
            touch() {
                if (this.$v && this.options.required) {
                    this.$v.mdata.$touch();
                    this.error = this.$v.mdata.$error;
                    return this.error;
                } else return false
            }
        }
    }
}

export function textareaMaker() {
    return {
        mixins: [mixins(), validationMixin],
        validations: {
            mdata: { required }
        },
        data() {
            return { error: false }
        },
        render() {
            const style = styles(this.options, { padding: this.options.printMode ? null : '4px 10px' });
            style['vertical-align'] = 'top';
            return this.options.printMode || this.options.readonly ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata?.split(/[\s\n]/).map(it => <div>{it}</div>)}</div>) :
                (<a-tooltip title="??????????????????!" placement="rightTop" visible={this.error} overlayStyle={{zIndex: 900}}>
                    <span>{this.options.required ? '???' : null}</span>
                    <a-textarea onBlur={$blur(this, this.$listeners.blur)} style={style} v-model={this.mdata} placeholder="?????????..." />
                </a-tooltip>);
        },
        methods: {
            touch() {
                if (this.$v && this.options.required) {
                    this.$v.mdata.$touch();
                    this.error = this.$v.mdata.$error;
                    return this.error;
                } else return false
            }
        }
    }
}

export function selectMaker() {
    return {
        mixins: [mixins(), validationMixin],
        validations: {
            mdata: { required }
        },
        data() {
            return { error: false }
        },
        render() {
            const style = styles(this.options);
            const list = this.options.options?.split(',') || [];
            return this.options.printMode || this.options.readonly ?
                (<div style={{ ...style, display: 'inline-block' }}>{list[this.mdata]}</div>) :
                (<a-tooltip title="??????????????????!" placement="rightTop" visible={this.error} overlayStyle={{zIndex: 900}}>
                    <span>{this.options.required ? '???' : null}</span>
                    <a-select allowClear onBlur={$blur(this, this.$listeners.blur)} style={style} v-model={this.mdata} placeholder="?????????...">
                        {list.map((val, idx) => (<a-select-option value={idx}>{val}</a-select-option>))}
                    </a-select>
                </a-tooltip>);
        },
        methods: {
            touch() {
                if (this.$v && this.options.required) {
                    this.$v.mdata.$touch();
                    this.error = this.$v.mdata.$error;
                    return this.error;
                } else return false
            }
        }
    }
}

export function dateMaker() {
    return {
        mixins: [mixins(), validationMixin],
        validations: {
            mdata: { required }
        },
        data() {
            return { error: false }
        },
        render() {
            const style = styles(this.options);
            return this.options.printMode || this.options.readonly ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata}</div>) :
                (<a-tooltip title="??????????????????!" placement="rightTop" visible={this.error} overlayStyle={{zIndex: 900}}>
                    <span>{this.options.required ? '???' : null}</span>
                    <a-date-picker onBlur={$blur(this, this.$listeners.blur)} style={style} allowClear v-model={this.mdata} format={this.options.format || 'YYYY-MM-DD'} placeholder="?????????..."/>
                </a-tooltip>);
        },
        methods: {
            touch() {
                if (this.$v && this.options.required) {
                    this.$v.mdata.$touch();
                    this.error = this.$v.mdata.$error;
                    return this.error;
                } else return false
            }
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
            return (<a-modal title="????????????" visible={this.visible} onCancel={() => this.$emit('change', false)} bodyStyle={{padding: '0'}} footer={null}>
                <div>
                    <div style="text-align: right; padding: 2px 10px 2px; background-color: #fafafa">
                        <a-input v-model={this.code} placeholder="??????" style="width: 120px; margin: 0 5px"/>
                        <a-input v-model={this.name} placeholder="??????" style="width: 120px; margin: 0 5px"/>
                        <a-button icon="search" type="dashed" shape="round" onClick={() => {
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
                            title: '??????',
                            width: '30%',
                            align: 'center'
                        }, {
                            dataIndex: 'name',
                            title: '??????',
                            width: '30%',
                            align: 'center'
                        }, {
                            dataIndex: 'desc',
                            title: '??????',
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
        mixins: [mixins(), validationMixin],
        validations: {
            mdata: { required }
        },
        data() {
            return { visible: false, error: false }
        },
        inject: ['vm'],
        render() {
            const style = styles(this.options);
            const SearchModal = searchModalMaker();
            return this.options.printMode || this.options.readonly ?
                (<div style={{ ...style, display: 'inline-block' }}>{this.mdata}</div>) :
                (<span>
                    <a-tooltip title="??????????????????!" placement="rightTop" visible={this.error} overlayStyle={{zIndex: 900}}>
                        <span>{this.options.required ? '???' : null}</span>
                        <a-input-search v-model={this.mdata} readOnly onBlur={$blur(this, this.$listeners.blur)} style={style} allowClear onSearch={() => this.visible = true } placeholder="?????????..."/>
                        {this.visible ? (<SearchModal id={this.options.options.dialog.id} idx={this.$attrs.idx} v-model={this.visible} onSelect={(record) => {
                            this.vm.cached = record
                            this.mdata = record.code
                            this.touch()
                        }}/>) : null}
                    </a-tooltip>
                </span>);
        },
        methods: {
            touch() {
                if (this.$v && this.options.required) {
                    this.$v.mdata.$touch();
                    this.error = this.$v.mdata.$error;
                    return this.error;
                } else return false
            }
        }
    }
}

const fn = () => { }
function $blur(vm, callback = fn) {
    var old = null;
    return function (e) {
        if (old != vm.mdata) {
            old = vm.mdata;
            vm.touch();
            callback(e);
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
    axios[api.method](api.url, {...conv(api.params,  this.vm), arg1: this.code, arg2: this.name, ...pagination}, config).then(res => {
        if (res.status == 200) {
            const page = {...pagination}
            page.total = res.data.total
            this.data = res.data.list
            this.page = page
        }
    })
}

function execSql(sql, pagination) {
    // ????????????
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
                case "arg1": {
                    result = (leftLike ? '%': '') + (this.code||'') + (rightLike ? '%': '')
                    break
                }
                case "arg2": {
                    result = (leftLike ? '%': '') + (this.name||'') + (rightLike ? '%': '')
                    break
                }
            }
        }
        return result
    });
    axios.post(`/editjs/execSql/${this.id}`, {params, ...pagination}).then(res => {
        if (res.status == 200) {
            const page = {...pagination}
            page.total = res.data.total
            this.data = res.data.list
            this.page = page
        }
    })
}

export default function (vue) {
    vue.component('f-input', inputMaker())
    vue.component('f-textarea', textareaMaker())
    vue.component('f-select', selectMaker())
    vue.component('f-date', dateMaker())
    vue.component('f-dialog', dialogMaker())
}