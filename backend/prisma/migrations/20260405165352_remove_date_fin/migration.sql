-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'OPERATOR', 'COMPANY', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProblemeStatus" AS ENUM ('DECLARED', 'UNDER_VERIFICATION', 'SENT_TO_COMPANY', 'REPAIRED', 'REPLACED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InterventionResult" AS ENUM ('REPAIRED', 'REPLACED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materiel" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "code_onee" TEXT NOT NULL,
    "numero_serie" TEXT NOT NULL,
    "numero_inventaire" TEXT NOT NULL,
    "date_arrive_drr" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Materiel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affectation" (
    "id" SERIAL NOT NULL,
    "materiel_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "entite" TEXT NOT NULL,
    "agence" TEXT NOT NULL,
    "secteur" TEXT NOT NULL,
    "centre" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Affectation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Probleme" (
    "id" SERIAL NOT NULL,
    "materiel_id" INTEGER NOT NULL,
    "declared_by_user_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ProblemeStatus" NOT NULL DEFAULT 'DECLARED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Probleme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intervention" (
    "id" SERIAL NOT NULL,
    "probleme_id" INTEGER NOT NULL,
    "operator_id" INTEGER NOT NULL,
    "company_id" INTEGER,
    "repare_par_admin" BOOLEAN NOT NULL DEFAULT false,
    "diagnostic" TEXT,
    "date_envoi_entreprise" TIMESTAMP(3),
    "reference_envoi" TEXT,
    "date_retour_drr" TIMESTAMP(3),
    "reference_retour" TEXT,
    "resultat" "InterventionResult",
    "date_intervention" TIMESTAMP(3),
    "date_retour_final" TIMESTAMP(3),

    CONSTRAINT "Intervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Remplacement" (
    "id" SERIAL NOT NULL,
    "intervention_id" INTEGER NOT NULL,
    "ancien_materiel_id" INTEGER NOT NULL,
    "nouveau_marque" TEXT NOT NULL,
    "nouveau_modele" TEXT NOT NULL,
    "nouveau_code_onee" TEXT NOT NULL,
    "nouveau_numero_serie" TEXT NOT NULL,

    CONSTRAINT "Remplacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historique" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "probleme_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Materiel_code_onee_key" ON "Materiel"("code_onee");

-- CreateIndex
CREATE UNIQUE INDEX "Materiel_numero_serie_key" ON "Materiel"("numero_serie");

-- CreateIndex
CREATE UNIQUE INDEX "Materiel_numero_inventaire_key" ON "Materiel"("numero_inventaire");

-- CreateIndex
CREATE INDEX "Affectation_materiel_id_idx" ON "Affectation"("materiel_id");

-- CreateIndex
CREATE INDEX "Affectation_user_id_idx" ON "Affectation"("user_id");

-- CreateIndex
CREATE INDEX "Probleme_materiel_id_idx" ON "Probleme"("materiel_id");

-- CreateIndex
CREATE INDEX "Probleme_declared_by_user_id_idx" ON "Probleme"("declared_by_user_id");

-- CreateIndex
CREATE INDEX "Intervention_probleme_id_idx" ON "Intervention"("probleme_id");

-- CreateIndex
CREATE INDEX "Intervention_operator_id_idx" ON "Intervention"("operator_id");

-- CreateIndex
CREATE INDEX "Intervention_company_id_idx" ON "Intervention"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "Remplacement_nouveau_code_onee_key" ON "Remplacement"("nouveau_code_onee");

-- CreateIndex
CREATE UNIQUE INDEX "Remplacement_nouveau_numero_serie_key" ON "Remplacement"("nouveau_numero_serie");

-- CreateIndex
CREATE INDEX "Remplacement_intervention_id_idx" ON "Remplacement"("intervention_id");

-- CreateIndex
CREATE INDEX "Remplacement_ancien_materiel_id_idx" ON "Remplacement"("ancien_materiel_id");

-- CreateIndex
CREATE INDEX "Historique_user_id_idx" ON "Historique"("user_id");

-- CreateIndex
CREATE INDEX "Historique_entity_type_entity_id_idx" ON "Historique"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "Message_probleme_id_idx" ON "Message"("probleme_id");

-- CreateIndex
CREATE INDEX "Message_sender_id_idx" ON "Message"("sender_id");

-- CreateIndex
CREATE INDEX "Message_receiver_id_idx" ON "Message"("receiver_id");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affectation" ADD CONSTRAINT "Affectation_materiel_id_fkey" FOREIGN KEY ("materiel_id") REFERENCES "Materiel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affectation" ADD CONSTRAINT "Affectation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Probleme" ADD CONSTRAINT "Probleme_materiel_id_fkey" FOREIGN KEY ("materiel_id") REFERENCES "Materiel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Probleme" ADD CONSTRAINT "Probleme_declared_by_user_id_fkey" FOREIGN KEY ("declared_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_probleme_id_fkey" FOREIGN KEY ("probleme_id") REFERENCES "Probleme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remplacement" ADD CONSTRAINT "Remplacement_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "Intervention"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remplacement" ADD CONSTRAINT "Remplacement_ancien_materiel_id_fkey" FOREIGN KEY ("ancien_materiel_id") REFERENCES "Materiel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique" ADD CONSTRAINT "Historique_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_probleme_id_fkey" FOREIGN KEY ("probleme_id") REFERENCES "Probleme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
