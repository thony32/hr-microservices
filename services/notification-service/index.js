/**
 * @swagger
 * components:
 *   schemas:
 *     NotifyDTO:
 *       type: object
 *       required: [dossierId]
 *       properties:
 *         dossierId: { type: integer }
 */

import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

const prisma = new PrismaClient();
const app = express();
app.use(cors(), express.json());

/**
 * @swagger
 * /beneficiary-change:
 *   post:
 *     tags: [Notification]
 *     summary: Recevoir l'événement beneficiaryChanged
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotifyDTO'
 *     responses:
 *       '202': { description: Accepted }
 */
app.post("/beneficiary-change", async (req, res) => {
	const { dossierId } = req.body;
	const dossier = await prisma.dossierClient.findUnique({
		where: { idClient: dossierId },
		include: { beneficiaire: true, employe: true },
	});
	console.log({ dossier }, "Avis envoyé à la compagnie d’assurance");
	res.status(202).json({ sent: true });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(3003, () => console.log("🔔 notification-service 3003"));
