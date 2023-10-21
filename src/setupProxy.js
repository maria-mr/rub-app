const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/david/rest_api_alu_materias_daw',
    createProxyMiddleware({
      target: 'https://scompcenter.com',
      changeOrigin: true,
      onProxyRes: function(proxyRes) {
        proxyRes.headers['access-control-allow-methods'] = 'GET, PUT, POST, DELETE';
      }
    })
  );
};