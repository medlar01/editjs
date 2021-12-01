<template>
    <a-layout class="form-setting">
        <a-layout-sider :width="260">
            <a-menu @select="onSelectMenu" mode="inline" :default-selected-keys="['dialog']">
                <a-menu-item key="dialog" title="弹窗选项设置">
                    <a-icon type="windows" />
                    弹窗选项设置
                </a-menu-item>
                <a-menu-item key="main" :title="'主表：' + data.main.table_comment">
                    <a-icon type="desktop" />
                    主表：{{data.main.table_comment}}
                </a-menu-item>
                <a-menu-item v-for="(t, idx) in (data.lines||[])" :key="'line-' + (idx + 1)" :title="'明细表：' + t.table_comment">
                    <a-icon type="tag" />
                    明细表：{{t.table_comment}}
                </a-menu-item>
            </a-menu>
        </a-layout-sider>
        <a-layout-content>
            <a-spin style="height: 100%" :spinning="loading" tip="Loading...">
                <a-table v-if="actKey != 'dialog'" rowKey="id" size="middle" :pagination="false" :columns="columns" :data-source="tableData"/>
                <template v-else>
                    <a-table rowKey="id" size="middle" :pagination="false" :columns="dialogColumns" :data-source="dialogs" />
                    <div style="text-align: center; margin: 20px">
                        <a-button style="width: 150px" type="dashed" shape="round" size="small" icon="edit" @click="dialogs.push({id: unique(), type: 'sql', api: {} })">
                            添加
                        </a-button>
                    </div>
                </template>
            </a-spin>
        </a-layout-content>
    </a-layout>
</template>

<script>
import VueCodemirror from "./VueCodemirror.vue"
import { unique } from '@/utils/common'
const nameMaps = { input: '文本', textarea: '文本域', number: '数值', date: '日期', select: '下拉', dialog: '弹窗' };
const EditableCell = {
    render() {
        return this.edit ? 
            (<div class="cell-wrapper">
                <a-select default-value={this.value} style="width: calc(100% - 30px)" size="small" onChange={(val) => this.val = val}>
                    {Object.keys(nameMaps).map((n) => (<a-select-option value={n}>{nameMaps[n]}</a-select-option>))}
                </a-select>
                <a-icon type="check" class="check-icon" onClick={() => {
                    this.$emit('edit', this.val);
                    this.edit = false;
                }} />
            </div>) :
            (<div class="cell-wrapper">
                {nameMaps[this.value]}
                <a-icon type="edit" class="edit-icon" onClick={() => {
                    this.edit = true;
                    this.val = this.value;
                }} />
            </div>);
    },
    props: {
        value: String
    },
    data() {
        return {
            val: '',
            edit: false
        }
    }
}

const ApiSqlModal = {
    props: ['dialogs', 'visible'],
    model: {
        event: 'change',
        prop: 'visible'
    },
    render() {
        return (<a-modal title="弹窗选项" visible={this.visible} onCancel={() => this.$emit('change', false)} onOk={this.ok} bodyStyle={{padding: '0'}} footer={null}>
            <div>
                <a-table row-key="id" data-source={this.dialogs} size="middle" 
                customRow={(record) => ({ on: {
                    dblclick: () => {
                        this.$emit('select', record)
                        this.$emit('change', false)
                    }
                }})}
                columns={[
                    {
                        dataIndex: 'id',
                        title: 'ID',
                        width: '50%'
                    }, {
                        dataIndex: 'type',
                        title: '类别',
                        width: '50%'
                    }
                ]}/>
            </div>
        </a-modal>);
    },
    methods: {
        ok() {
            this.$emit('change', false);
        }
    }
};

const EditCell = {
    props: ['row', 'dialogs'],
    data() {
        return { visible: false }
    },
    render() {
        let slot = null;
        switch(this.row.category) {
            case "date": {
                slot = (<a-input size="small" style="width: 200px" v-model={this.row.format} placeholder="请输入日期格式"/>);
                break;
            }
            case "select": {
                slot = (<a-input size="small" style="width: 200px" v-model={this.row.options} placeholder="请输入选项，使用【,】分割"/>);
                break;
            }
            case "dialog": {
                slot = (<span>
                    <a-input-search size="small" readOnly style="width: 200px" v-model={this.row.options} placeholder="请选择弹窗选项" onSearch={() => this.visible = true}/>
                    <ApiSqlModal dialogs={this.dialogs} v-model={this.visible} onSelect={(record) => this.row.options = record.id } />
                </span>);
                break;
            }
        }
        return (<div>{slot}</div>);
    }
}
const DialogEditCell = {
    props: ['row'],
    render() {
        let slot = null;
        switch(this.row.type) {
            case "sql": {
                slot = (<a-textarea size="small" v-model={this.row.sql} placeholder="请输入数据库脚本"/>);
                break;
            }
            case "api": {
                if (!this.row.api.params) {
                    this.$set(this.row.api, 'params', [{}])
                }
                this.row.api.value  = this.row.api.value || '// 请编写请求头信息';
                const paramList = this.row.api.params;
                const paramsSlot = (<div>
                    {paramList.map((it, idx) => (<div>
                        <a-input v-model={it.key} size="small" placeholder="键" style="width: 120px; margin: 2px 0" />：
                        <a-input v-model={it.value} size="small" placeholder="值"  style="width: 260px; margin: 2px 5px 0" />
                        {idx == paramList.length - 1 ? 
                        <a-button type="dashed" shape="round" size="small" icon="plus" onClick={() => paramList.push({})}/> : 
                        <a-button type="dashed" shape="round" size="small" icon="minus" onClick={() => paramList.splice(idx, 1)}/>}
                    </div>))}
                </div>);
                slot = (<span>
                    <a-select default-value="get" size="small" style="width: 100px" v-model={this.row.api.method}
                        onChange={(val) => {
                        this.row.api.method = val;
                    }}>
                        <a-select-option value="get"> GET </a-select-option>
                        <a-select-option value="post"> POST </a-select-option>
                    </a-select>&nbsp;
                    <a-input size="small" placeholder="请输入地址" style="width: calc(100% - 105px)" v-model={this.row.api.url} />
                    <br />
                    <VueCodemirror style="margin: 5px 0" v-model={this.row.api.value} />
                    {paramsSlot}
                </span>);
            }
        }
        return (<div>{slot}</div>);
    }
}

export default {
    props: {
        data: {
            type: Object,
            default() {
                return {}
            }
        },
        dialogs: {
            type: Array,
            default() {
                return []
            }
        }
    },

    data() {
        return {
            unique,
            loading: false,
            actKey: 'dialog',
            columns: [
                {
                    width: 260,
                    title: '键名',
                    dataIndex: 'name',
                    customRender: name => {
                        return (<span>{name?.toUpperCase()}</span>);
                    }
                },
                {
                    width: 280,
                    key: 'comment',
                    title: '描述',
                    dataIndex: 'comment'
                },
                {
                    width: 150,
                    title: '是否主键',
                    dataIndex: 'pk',
                    customRender: pk => {
                        return (<span>{pk ? '是（Y）': '否（N）'}</span>);
                    }
                },
                {
                    width: 120,
                    key: 'category',
                    title: '表单类别',
                    dataIndex: 'category',
                    customRender: (val, row) => {
                        return (<EditableCell value={val} onEdit={(value) =>  row.category = value} />);
                    }
                }, {
                    key: '-',
                    title: '其他',
                    dataIndex: '-',
                    customRender: (val, row) => {
                        return (<EditCell row={row} dialogs={this.dialogs} />);
                    }
                }
            ],
            dialogColumns: [
                {
                    width: 120,
                    title: '键名',
                    dataIndex: 'id',
                    customCell: () => {
                        return {
                            style: 'vertical-align: top'
                        }
                    }
                },
                {
                    width: 120,
                    key: 'type',
                    title: '类型',
                    dataIndex: 'type',
                    customCell: () => {
                        return {
                            style: 'vertical-align: top'
                        }
                    },
                    customRender: (val, row) => {
                        return (
                        <a-select v-model={row.type} style="width: 100px" size="small">
                            <a-select-option value="sql">
                                SQL
                            </a-select-option>
                            <a-select-option value="api">
                                API
                            </a-select-option>
                        </a-select>);
                    }
                },
                {
                    key: '-',
                    title: '动作',
                    dataIndex: '-',
                    customRender: (val, row) => {
                        return (<DialogEditCell row={row} />);
                    }
                },
                {
                    width: 80,
                    key: '#',
                    title: '//',
                    dataIndex: '#',
                    customRender: (val, row, idx) => {
                        return (<a-button type="dashed" onClick={() => this.dialogs.splice(idx, 1)} size="small">删除</a-button>);
                    }
                }
            ],
            tableData: {}
        }
    },

    created() {
        this.tableData = this.data.main.fields;
    },

    methods: {
        onSelectMenu({item, key}) {
            this.loading = true;
            setTimeout(() => {
                if (key == 'main') {
                    this.tableData = this.data.main.fields;
                } else if (key == 'dialog') {
                    //
                } else {
                    const split = key.split('-');
                    const index = parseInt(split[1]) - 1;
                    this.tableData = this.data.lines[index].fields;
                }
                this.actKey = key;
                this.loading = false;
            }, 500);
        }
    }
}
</script>

<style lang="scss">
.form-setting {
    .cell-wrapper > .check-icon {
        float: right;
        margin-top: 4px;
        color: #1890ff;
    }
    .cell-wrapper > .edit-icon {
        float: right;
        display: none;
        margin-top: 3px;
        color: #979797;
    }
    .cell-wrapper:hover > .edit-icon {
        display: unset;
    }
}
</style>
