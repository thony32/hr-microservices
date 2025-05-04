import { fileURLToPath } from "url"
import path from "path"
import swaggerJSDoc from "swagger-jsdoc"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const swaggerSpec = swaggerJSDoc({
    definition: { openapi: "3.0.0", info: { title: "admin-service", version: "1.0.0" }, servers: [{ url: "http://localhost:3005" }] },
    apis: [path.join(__dirname, "index.js")],
})
