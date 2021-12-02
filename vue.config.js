module.exports = {
    devServer: {
        host: '0.0.0.0',
        port: '8080',
        proxy: {
            '/bapi/api': {
                target: 'http://www.kuaidi100.com',
                changeOrigin: true,
                pathRewrite: {
                    '^/bapi/api': '/'
                }
            },
            '/bapi': {
                target: 'http://127.0.0.1:8081',
                changeOrigin: true,
                pathRewrite: {
                    '^/bapi': '/'
                }
            }
        }
    }
}