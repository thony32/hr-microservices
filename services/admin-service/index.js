/**
 * @swagger
 * components:
 *   schemas:
 *     Employe:
 *       type: object
 *       properties:
 *         numeroEmploye:          { type: integer, readOnly: true }
 *         nom:                    { type: string }
 *         adresse:                { type: string }
 *         email:                  { type: string, format: email }
 *         numeroAssuranceSociale: { type: string }
 *         estAuthentifie:         { type: boolean }
 *     Beneficiaire:
 *       type: object
 *       properties:
 *         idBeneficiaire: { type: integer, readOnly: true }
 *         nom:            { type: string }
 *     ConseillerRH:
 *       type: object
 *       properties:
 *         idConseiller:  { type: string }
 *         nomConseiller: { type: string }
 */

import "dotenv/config";
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
 * /employees:
 *   post:
 *     tags: [Employee]
 *     summary: Créer un employé
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employe'
 *     responses:
 *       '201': { description: Employé créé }
 *       '409': { description: Email déjà utilisé }
 */
app.post("/employees", async (req, res, next) => {
	try {
		const data = { ...req.body };
		data.numeroEmploye = undefined;
		const created = await prisma.employe.create({ data });
		res.status(201).json(created);
	} catch (err) {
		if (err.code === "P2002") {
			return res.status(409).json({ message: "Email déjà utilisé" });
		}
		next(err);
	}
});

/**
 * @swagger
 * /employees:
 *   get:
 *     tags: [Employee]
 *     summary: Lister les employés
 *     responses:
 *       '200': { description: OK }
 */
app.get("/employees", async (_, res) =>
	res.json(await prisma.employe.findMany()),
);

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     tags: [Employee]
 *     summary: Détail d'un employé
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 */
app.get("/employees/:id", async (req, res) =>
	res.json(
		await prisma.employe.findUnique({
			where: { numeroEmploye: +req.params.id },
		}),
	),
);

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     tags: [Employee]
 *     summary: Mettre à jour un employé
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Employe' }
 *     responses:
 *       '200': { description: OK }
 */
app.put("/employees/:id", async (req, res) =>
	res.json(
		await prisma.employe.update({
			where: { numeroEmploye: +req.params.id },
			data: req.body,
		}),
	),
);

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     tags: [Employee]
 *     summary: Supprimer un employé
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: Supprimé }
 */
app.delete("/employees/:id", async (req, res) =>
	res.json(
		await prisma.employe.delete({ where: { numeroEmploye: +req.params.id } }),
	),
);

/**
 * @swagger
 * /beneficiaries/{id}:
 *   get:
 *     tags: [Beneficiary]
 *     summary: Lire un bénéficiaire
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: OK }
 */
app.get("/beneficiaries/:id", async (req, res) =>
	res.json(
		await prisma.beneficiaire.findUnique({
			where: { idBeneficiaire: +req.params.id },
		}),
	),
);

/**
 * @swagger
 * /beneficiaries/{id}:
 *   delete:
 *     tags: [Beneficiary]
 *     summary: Supprimer un bénéficiaire
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: Supprimé }
 */
app.delete("/beneficiaries/:id", async (req, res) =>
	res.json(
		await prisma.beneficiaire.delete({
			where: { idBeneficiaire: +req.params.id },
		}),
	),
);

/**
 * @swagger
 * /counselors:
 *   post:
 *     tags: [Counselor]
 *     summary: Créer un conseiller RH
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ConseillerRH' }
 *     responses:
 *       '200': { description: OK }
 */
app.post("/counselors", async (req, res) =>
	res.json(await prisma.conseillerRH.create({ data: req.body })),
);

/* Swagger & erreur serveur */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(500).json({ message: "Erreur interne" });
});

app.listen(3005, () => console.log("👑 admin-service opérationnel sur 3005"));
