/**
 * @swagger
 * components:
 *   schemas:
 *     VerifyRequest:
 *       type: object
 *       required: [numeroEmploye, nom, adresse, numeroAssuranceSociale]
 *       properties:
 *         numeroEmploye:          { type: integer }
 *         nom:                    { type: string }
 *         adresse:                { type: string }
 *         numeroAssuranceSociale: { type: string }
 *     BeneficiaireDTO:
 *       type: object
 *       required: [nom]
 *       properties:
 *         nom: { type: string }
 *     CompagnieDTO:
 *       type: object
 *       required: [idCompagnieAssurance, nomEntreprise]
 *       properties:
 *         idCompagnieAssurance: { type: string }
 *         nomEntreprise:        { type: string }
 *     CreateDossier:
 *       type: object
 *       required: [numeroEmploye, idBeneficiaire]
 *       properties:
 *         numeroEmploye:  { type: integer }
 *         idBeneficiaire: { type: integer }
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import nodemailer from "nodemailer";
import swaggerUi from "swagger-ui-express";
import { httpRequest } from "../../shared/httpClient.js";
import { swaggerSpec } from "./swagger.js";

const prisma = new PrismaClient();
const app = express();
app.use(cors(), express.json());

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Vérifier l'identité d'un employé
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyRequest'
 *     responses:
 *       '200': { description: OK }
 *       '401': { description: Identité invalide }
 */
app.post("/auth/verify", async (req, res) => {
	const { numeroEmploye, nom, adresse, numeroAssuranceSociale } = req.body;
	const emp = await prisma.employe.findUnique({ where: { numeroEmploye } });
	if (
		!emp ||
		emp.nom !== nom ||
		emp.adresse !== adresse ||
		emp.numeroAssuranceSociale !== numeroAssuranceSociale
	)
		return res.status(401).json({ isValid: false });
	const updated = await prisma.employe.update({
		where: { numeroEmploye },
		data: { estAuthentifie: true },
	});
	res.json({ isValid: true, employe: updated });
});

/**
 * @swagger
 * /beneficiaries:
 *   post:
 *     tags: [Beneficiary]
 *     summary: Créer un bénéficiaire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BeneficiaireDTO'
 *     responses:
 *       '201': { description: Créé }
 */
app.post("/beneficiaries", async (r, s) =>
	s.status(201).json(await prisma.beneficiaire.create({ data: r.body })),
);

/**
 * @swagger
 * /beneficiaries/{id}:
 *   put:
 *     tags: [Beneficiary]
 *     summary: Modifier un bénéficiaire
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BeneficiaireDTO'
 *     responses:
 *       '200': { description: OK }
 */
app.put("/beneficiaries/:id", async (r, s) =>
	s.json(
		await prisma.beneficiaire.update({
			where: { idBeneficiaire: +r.params.id },
			data: r.body,
		}),
	),
);

/**
 * @swagger
 * /companies:
 *   post:
 *     tags: [Company]
 *     summary: Créer une compagnie d'assurance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompagnieDTO'
 *     responses:
 *       '201': { description: Créée }
 */
app.post("/companies", async (r, s) =>
	s.status(201).json(await prisma.compagnieAssurance.create({ data: r.body })),
);

/**
 * @swagger
 * /dossiers:
 *   post:
 *     tags: [Dossier]
 *     summary: Créer un dossier client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDossier'
 *     responses:
 *       '201': { description: Créé }
 *       '403': { description: Employé non authentifié }
 */
app.post("/dossiers", async (req, res) => {
	const { numeroEmploye, idBeneficiaire } = req.body;
	const emp = await prisma.employe.findUnique({ where: { numeroEmploye } });
	if (!emp?.estAuthentifie)
		return res.status(403).json({ message: "Employé non authentifié" });

	const dossier = await prisma.dossierClient.create({
		data: { numeroEmploye, idBeneficiaire },
	});

	// NOTE: Example of sending an email

	const t = nodemailer.createTransport({ streamTransport: true });
	await t.sendMail({
		from: "hr@corp.local",
		to: emp.email,
		subject: "Confirmation",
		text: "Changement effectué",
	});

	// NOTE: Example of sending a notification to another service using the gateway
	await httpRequest("http://localhost:8080/notify/beneficiary-change", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ dossierId: dossier.idClient }),
	});

	res.status(201).json(dossier);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(3001, () => console.log("💼 hr-service 3001"));
