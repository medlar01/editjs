import Mockjs from 'mockjs'

Mockjs.mock('/bapi/editjs/example/emp', 'post', (config) => {
    console.log('mock.config', config);
    return {
        total: 2,
        list: [
            {
            "code": "T008413",
            "name": "张三",
            "desc": "职员"
            },
            {
            "code": "T007580",
            "name": "李四",
            "desc": "计件工"
            }
        ]
    }
})

Mockjs.mock('/bapi/editjs/example/dept', 'post', (config) => {
    console.log('mock.config', config);
    let list = [
            { "code": "C01", "name": "财务一部", "desc": "管账的..." },
            { "code": "C02", "name": "财务二部", "desc": "管账的..." },
            { "code": "C03", "name": "财务三部", "desc": "管账的..." },
            { "code": "C04", "name": "财务四部", "desc": "管账的..." },
            { "code": "C05", "name": "财务五部", "desc": "管账的..." },
            { "code": "C06", "name": "财务六部", "desc": "管账的..." },
            { "code": "C07", "name": "财务七部", "desc": "管账的..." },
            { "code": "C08", "name": "财务八部", "desc": "管账的..." },
            { "code": "C09", "name": "财务九部", "desc": "管账的..." },
            { "code": "C010", "name": "财务十部", "desc": "管账的..." },
            { "code": "C011", "name": "财务十一部", "desc": "管账的..." }
    ];
    const params = JSON.parse(config.body)
    if (params.searchCode && params.searchCode.trim() != '') {
        list = list.filter(it => it.code == params.searchCode);
    }
    if (params.searchName && params.searchName.trim() != '') {
        list = list.filter(it => it.code === params.searchName);
    }
    const fromIndex = (params.current - 1) * params.pageSize;
    const toIndex = Math.min(fromIndex + params.pageSize, list.length)
    const result = {
        total: list.length,
        list: list.slice(fromIndex, toIndex)
    }
    console.log('result', result, fromIndex, toIndex);
    return result
})

Mockjs.mock(RegExp('/bapi/editjs/example/itemtype[?]{0,1}[^?]*'), 'get', (config) => { 
    console.log('mock.config', config);
    return {
        total: 3,
        list: [
            { code: '显示器', name: '显示器' },
            { code: '笔记本', name: '笔记本' },
            { code: '电脑主机', name: '电脑主机' },
        ]
    }
})