// gateway/index.js
import express from 'express';
import { createProxyMiddleware as proxy } from 'http-proxy-middleware';

const app = express();

app.get('/', (_req, res) => {
  res.send(`<h2>API Gateway</h2>
    <ul>
      <li><a href="/admin/api-docs">Admin</a></li>
      <li><a href="/hr/api-docs">HR</a></li>
      <li><a href="/file/api-docs">File</a></li>
      <li><a href="/notify/api-docs">Notification</a></li>
    </ul>`);
});

app.use('/admin',  proxy({ target:'http://localhost:3005', changeOrigin:true, pathRewrite:{'^/admin':''} }));
app.use('/hr',     proxy({ target:'http://localhost:3001', changeOrigin:true, pathRewrite:{'^/hr':''} }));
app.use('/file',   proxy({ target:'http://localhost:3002', changeOrigin:true, pathRewrite:{'^/file':''} }));
app.use('/notify', proxy({ target:'http://localhost:3003', changeOrigin:true, pathRewrite:{'^/notify':''} }));

app.listen(8080, () => console.log('🛡️  Gateway sur http://localhost:8080'));
