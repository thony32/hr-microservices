/**
 * @swagger
 * components:
 *   schemas:
 *     AssociateDTO:
 *       type: object
 *       required: [numeroEmploye, idBeneficiaire]
 *       properties:
 *         numeroEmploye:  { type: integer }
 *         idBeneficiaire: { type: integer }
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
 * /associate:
 *   post:
 *     tags: [Association]
 *     summary: Associer un employé à un bénéficiaire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssociateDTO'
 *     responses:
 *       '200': { description: OK }
 */
app.post("/associate", async (req, res) => {
	const { numeroEmploye, idBeneficiaire } = req.body;
	let dossier = await prisma.dossierClient.findFirst({
		where: { numeroEmploye },
	});
	dossier = dossier
		? await prisma.dossierClient.update({
				where: { idClient: dossier.idClient },
				data: { idBeneficiaire },
			})
		: await prisma.dossierClient.create({
				data: { numeroEmploye, idBeneficiaire },
			});
	res.json(dossier);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(3002, () => console.log("📂 file-service 3002"));
