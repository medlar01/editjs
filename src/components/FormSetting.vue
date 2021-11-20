<template>
    <a-layout class="form-setting">
        <a-layout-sider :width="260">
            <a-menu @select="onSelectMenu" mode="inline" :default-selected-keys="['main']">
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
                <a-table rowKey="id" size="middle" :pagination="false" :columns="columns" :data-source="tableData">
                </a-table>
            </a-spin>
        </a-layout-content>
    </a-layout>
</template>

<script>
import { hasKey } from '@/utils/common'
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
};

const EditCell = {
    props: ['row'],
    render() {
        console.log('EditCell.row', this.row);
        let slot = null;
        switch(this.row.category) {
            case "date": {
                slot = (<a-input size="small" style="width: 200px" v-model={this.row.format} placeholder="请输入日期格式"/>);
                break;
            }
            case "select": {
                // if (!hasKey(this.row, 'options')) {
                //     this.$set(this.row, 'options', null);
                // }
                slot = (<a-input size="small" style="width: 200px" v-model={this.row.options} placeholder="请输入选项，使用【,】分割"/>);
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
        }
    },

    data() {
        return {
            loading: false,
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
                        return (<EditCell row={row} />);
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
                } else {
                    const split = key.split('-');
                    const index = parseInt(split[1]) - 1;
                    this.tableData = this.data.lines[index].fields;
                }
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
