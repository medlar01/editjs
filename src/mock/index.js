import Mockjs from 'mockjs'

Mockjs.mock('http://192.168.0.5:8080/api/data', 'get', {
    code: 200,
    data: {
        code: 'No9527',
        name: '张三'
    }
})