/**
 * @swagger
 * tags:
 *   - name: Employee
 *   - name: Beneficiary
 *   - name: Counselor
 *
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
 *     ConseillerRH:
 *       type: object
 *       properties:
 *         idConseiller:  { type: string }
 *         nomConseiller: { type: string }
 */

import express from "express"
import cors from "cors"
import { PrismaClient } from "@prisma/client"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./swagger.js"

const prisma = new PrismaClient()
const app = express()
app.use(cors(), express.json())

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
 *           schema: { $ref: '#/components/schemas/Employe' }
 *     responses:
 *       '201': { description: Employé créé }
 *       '409': { description: Email déjà utilisé }
 */
app.post("/employees", async (req, res, next) => {
    try {
        const data = { ...req.body }
        delete data.numeroEmploye
        const emp = await prisma.employe.create({ data })
        res.status(201).json(emp)
    } catch (e) {
        if (e.code === "P2002") return res.status(409).json({ message: "Email déjà utilisé" })
        next(e)
    }
})

/**
 * @swagger
 * /employees:
 *   get:
 *     tags: [Employee]
 *     summary: Lister les employés
 *     responses:
 *       '200': { description: OK }
 */
app.get("/employees", async (_, res) => res.json(await prisma.employe.findMany()))

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
app.get("/employees/:id", async (r, s) => s.json(await prisma.employe.findUnique({ where: { numeroEmploye: +r.params.id } })))

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
 *     responses: { '200': { description: OK } }
 */
app.put("/employees/:id", async (r, s) => s.json(await prisma.employe.update({ where: { numeroEmploye: +r.params.id }, data: r.body })))

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
 *     responses: { '200': { description: Supprimé } }
 */
app.delete("/employees/:id", async (r, s) => s.json(await prisma.employe.delete({ where: { numeroEmploye: +r.params.id } })))

/**
 * @swagger
 * /employees/{id}/auth:
 *   put:
 *     tags: [Employee]
 *     summary: Marquer un employé comme authentifié (appel interne)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses: { '200': { description: OK } }
 */
app.put("/employees/:id/auth", async (r, s) =>
    s.json(await prisma.employe.update({ where: { numeroEmploye: +r.params.id }, data: { estAuthentifie: true } })),
)

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
 *     responses: { '201': { description: Créé } }
 */
app.post("/counselors", async (r, s) => s.status(201).json(await prisma.conseillerRH.create({ data: r.body })))

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use((e, _req, res, _next) => {
    console.error(e)
    res.status(500).json({ msg: "Erreur interne" })
})
app.listen(3005, () => console.log("admin-service 3005"))
