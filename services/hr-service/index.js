/**
 * @swagger
 * tags:
 *   - name: Auth
 *   - name: Beneficiary
 *   - name: Dossier
 * components:
 *   schemas:
 *     VerifyRequest:
 *       type: object
 *       required:
 *         - numeroEmploye
 *         - nom
 *         - adresse
 *         - numeroAssuranceSociale
 *       properties:
 *         numeroEmploye:          { type: integer }
 *         nom:                    { type: string }
 *         adresse:                { type: string }
 *         numeroAssuranceSociale: { type: string }
 *     BeneficiaireDTO:
 *       type: object
 *       required:
 *         - nom
 *       properties:
 *         nom: { type: string }
 *     DossierDTO:
 *       type: object
 *       required:
 *         - numeroEmploye
 *         - idBeneficiaire
 *       properties:
 *         numeroEmploye:  { type: integer }
 *         idBeneficiaire: { type: integer }
 */

import "dotenv/config"
import express from "express"
import cors from "cors"
import { PrismaClient } from "@prisma/client"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./swagger.js"
import { httpRequest } from "../../shared/httpClient.js"
import nodemailer from "nodemailer"

const prisma = new PrismaClient()
const app = express()
app.use(cors(), express.json())

const ADMIN = process.env.ADMIN_URL || "http://localhost:3005"
const FILE = process.env.FILE_URL || "http://localhost:3002"
const NOTIF = process.env.NOTIFY_URL || "http://localhost:3003/beneficiary-change"

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Vérifier l'identité d'un employé
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyRequest'
 *     responses:
 *       '200':
 *         description: Employé authentifié
 *       '401':
 *         description: Identité invalide
 */
app.post("/auth/verify", async (req, res) => {
    const body = req.body
    const emp = await httpRequest(`${ADMIN}/employees/${body.numeroEmploye}`)
    if (!emp || emp.nom !== body.nom || emp.adresse !== body.adresse || emp.numeroAssuranceSociale !== body.numeroAssuranceSociale)
        return res.status(401).json({ isValid: false })

    await httpRequest(`${ADMIN}/employees/${body.numeroEmploye}/auth`, { method: "PUT" })
    res.json({ isValid: true })
})

/**
 * @swagger
 * /beneficiaries:
 *   post:
 *     tags:
 *       - Beneficiary
 *     summary: Créer un bénéficiaire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BeneficiaireDTO'
 *     responses:
 *       '201':
 *         description: Créé
 */
app.post("/beneficiaries", async (r, s) => s.status(201).json(await prisma.beneficiaire.create({ data: r.body })))

/**
 * @swagger
 * /beneficiaries/{id}:
 *   put:
 *     tags:
 *       - Beneficiary
 *     summary: Modifier un bénéficiaire
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BeneficiaireDTO'
 *     responses:
 *       '200':
 *         description: OK
 */
app.put("/beneficiaries/:id", async (r, s) =>
    s.json(
        await prisma.beneficiaire.update({
            where: { idBeneficiaire: +r.params.id },
            data: r.body,
        }),
    ),
)

/**
 * @swagger
 * /dossiers:
 *   post:
 *     tags:
 *       - Dossier
 *     summary: Créer un dossier client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DossierDTO'
 *     responses:
 *       '201':
 *         description: Créé
 *       '403':
 *         description: Employé non authentifié
 */
app.post("/dossiers", async (req, res) => {
    const { numeroEmploye, idBeneficiaire } = req.body

    const emp = await httpRequest(`${ADMIN}/employees/${numeroEmploye}`)
    if (!emp.estAuthentifie) return res.status(403).json({ message: "Employé non authentifié" })

    const dossier = await httpRequest(`${FILE}/associate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numeroEmploye, idBeneficiaire }),
    })

    const transport = nodemailer.createTransport({ host: "localhost", port: 25 })
    await transport.sendMail({
        from: "hr@corp.local",
        to: emp.email,
        subject: "Confirmation changement bénéficiaire",
        text: `Votre dossier ${dossier.idClient} a été mis à jour`,
    })

    await httpRequest(NOTIF, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId: dossier.idClient }),
    })

    res.status(201).json(dossier)
})

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.listen(3001, () => console.log("hr-service 3001"))
