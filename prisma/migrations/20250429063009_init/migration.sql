-- CreateTable
CREATE TABLE "Employe" (
    "numeroEmploye" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "numeroAssuranceSociale" TEXT NOT NULL,
    "estAuthentifie" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employe_pkey" PRIMARY KEY ("numeroEmploye")
);

-- CreateTable
CREATE TABLE "Beneficiaire" (
    "idBeneficiaire" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beneficiaire_pkey" PRIMARY KEY ("idBeneficiaire")
);

-- CreateTable
CREATE TABLE "DossierClient" (
    "idClient" SERIAL NOT NULL,
    "numeroEmploye" INTEGER NOT NULL,
    "idBeneficiaire" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DossierClient_pkey" PRIMARY KEY ("idClient")
);

-- CreateTable
CREATE TABLE "ConseillerRH" (
    "idConseiller" TEXT NOT NULL,
    "nomConseiller" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConseillerRH_pkey" PRIMARY KEY ("idConseiller")
);

-- CreateTable
CREATE TABLE "CompagnieAssurance" (
    "idCompagnieAssurance" TEXT NOT NULL,
    "nomEntreprise" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompagnieAssurance_pkey" PRIMARY KEY ("idCompagnieAssurance")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employe_email_key" ON "Employe"("email");

-- AddForeignKey
ALTER TABLE "DossierClient" ADD CONSTRAINT "DossierClient_numeroEmploye_fkey" FOREIGN KEY ("numeroEmploye") REFERENCES "Employe"("numeroEmploye") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DossierClient" ADD CONSTRAINT "DossierClient_idBeneficiaire_fkey" FOREIGN KEY ("idBeneficiaire") REFERENCES "Beneficiaire"("idBeneficiaire") ON DELETE RESTRICT ON UPDATE CASCADE;
