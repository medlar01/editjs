module.exports = {
    devServer: {
        host: '0.0.0.0',
        port: '8080',
        proxy: {
            '/api': {
                target: 'http://www.kuaidi100.com',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/'
                }
            }
        }
    }
}