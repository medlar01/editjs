export default function() {
    return {
        main: {
            table_name: 'employee_goods',
            table_comment: '职员行政物品领用',
            fields: [
                {
                    name: 'id',
                    comment: '主键',
                    pk: true,
                    category: 'input',
                    editable: true
                },
                {
                    name: 'employee_code',
                    comment: '员工工号',
                    category: 'dialog',
                    editable: true,
                    id: 'f1j47a194g2h'
                },
                {
                    name: 'employee_name',
                    comment: '员工姓名',
                    category: 'input',
                    editable: true
                },
                {
                    name: 'department_code',
                    comment: '部门编码',
                    category: 'dialog',
                    editable: false
                },
                {
                    name: 'department_name',
                    comment: '部门名称',
                    category: 'input',
                    editable: false
                },
                {
                    name: 'position',
                    comment: '职位',
                    category: 'input',
                    editable: false
                },
                {
                    name: 'recv_date',
                    comment: '领用日期',
                    category: 'date',
                    editable: false
                },
                {
                    name: 'remark',
                    comment: '备注信息',
                    category: 'textarea',
                    editable: false
                }
            ]
        },
        lines: [
            {
                table_name: 'employee_goods',
                table_comment: '物品领用明细',
                fields: [
                    {
                        name: 'id',
                        comment: '主键',
                        pk: true,
                        category: 'input',
                        editable: true
                    },
                    {
                        name: 'code',
                        comment: '物品编码',
                        category: 'input',
                        editable: true
                    },
                    {
                        name: 'name',
                        comment: '物品名称',
                        category: 'input',
                        editable: true
                    },
                    {
                        name: 'category',
                        comment: '物品类型',
                        category: 'select',
                        editable: true
                    },
                    {
                        name: 'specification',
                        comment: '物品规格',
                        category: 'select',
                        editable: true
                    }
                ]
            }
        ]
    }
}