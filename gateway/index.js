// gateway/index.js (version corrigée)
import express from "express";
import { createProxyMiddleware as proxy } from "http-proxy-middleware";

const app = express();

// petite page d’accueil
app.get("/", (_req, res) => {
	res.send(`
    <h2>API Gateway</h2>
    <ul>
      <li><a href="/admin/api-docs">Admin API</a></li>
      <li><a href="/hr/api-docs">HR API</a></li>
      <li><a href="/file/api-docs">File API</a></li>
      <li><a href="/notify/api-docs">Notification API</a></li>
    </ul>
  `);
});

// proxys
app.use(
	"/admin",
	proxy({
		target: "http://localhost:3005",
		changeOrigin: true,
		pathRewrite: { "^/admin": "" },
	}),
);
app.use(
	"/hr",
	proxy({
		target: "http://localhost:3001",
		changeOrigin: true,
		pathRewrite: { "^/hr": "" },
	}),
);
app.use(
	"/file",
	proxy({
		target: "http://localhost:3002",
		changeOrigin: true,
		pathRewrite: { "^/file": "" },
	}),
);
app.use(
	"/notify",
	proxy({
		target: "http://localhost:3003",
		changeOrigin: true,
		pathRewrite: { "^/notify": "" },
	}),
);

app.listen(8080, () => console.log("🛡️  Gateway sur http://localhost:8080"));
