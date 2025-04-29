import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJSDoc from "swagger-jsdoc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const swaggerSpec = swaggerJSDoc({
	definition: {
		openapi: "3.0.0",
		info: { title: "hr-service API", version: "1.0.0" },
		servers: [{ url: "http://localhost:3001" }],
	},
	apis: [path.join(__dirname, "index.js")],
});
