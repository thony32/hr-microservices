/**
 * @swagger
 * tags:
 *   - name: Notification
 * components:
 *   schemas:
 *     NotifyDTO:
 *       type: object
 *       required:
 *         - dossierId
 *       properties:
 *         dossierId:
 *           type: integer
 */

import express from "express"
import cors from "cors"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./swagger.js"

const app = express()
app.use(cors(), express.json())

/**
 * @swagger
 * /beneficiary-change:
 *   post:
 *     tags:
 *       - Notification
 *     summary: Recevoir l'événement beneficiaryChanged
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotifyDTO'
 *     responses:
 *       '202':
 *         description: Accepted
 */
app.post("/beneficiary-change", (req, res) => {
    console.log("Notification envoyée pour dossier", req.body.dossierId)
    res.status(202).json({ sent: true })
})

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.listen(3003, () => console.log("notification-service 3003"))
