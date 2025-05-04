/**
 * @swagger
 * tags:
 *   - name: Dossier
 * components:
 *   schemas:
 *     DossierDTO:
 *       type: object
 *       required:
 *         - numeroEmploye
 *         - idBeneficiaire
 *       properties:
 *         numeroEmploye:  { type: integer }
 *         idBeneficiaire:{ type: integer }
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
 * /associate:
 *   post:
 *     tags:
 *       - Dossier
 *     summary: Créer ou mettre à jour la liaison Employé ↔ Bénéficiaire
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DossierDTO'
 *     responses:
 *       '200':
 *         description: OK
 */
app.post("/associate", async (req, res) => {
    const { numeroEmploye, idBeneficiaire } = req.body
    let dossier = await prisma.dossierClient.findFirst({ where: { numeroEmploye } })
    dossier = dossier
        ? await prisma.dossierClient.update({
              where: { idClient: dossier.idClient },
              data: { idBeneficiaire },
          })
        : await prisma.dossierClient.create({ data: { numeroEmploye, idBeneficiaire } })
    res.json(dossier)
})

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.listen(3002, () => console.log("file-service 3002"))
