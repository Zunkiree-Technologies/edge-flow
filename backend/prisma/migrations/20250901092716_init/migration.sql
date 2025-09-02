-- CreateEnum
CREATE TYPE "public"."WageType" AS ENUM ('per_piece', 'hourly', 'monthly');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rolls" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "vendor_id" INTEGER,

    CONSTRAINT "rolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."batches" (
    "id" SERIAL NOT NULL,
    "roll_id" INTEGER,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "vendor_id" INTEGER,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sub_batches" (
    "id" SERIAL NOT NULL,
    "roll_id" INTEGER,
    "batch_id" INTEGER,
    "estimated_pieces" INTEGER NOT NULL,
    "expected_items" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "department_id" INTEGER,

    CONSTRAINT "sub_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sub_batch_size_details" (
    "id" SERIAL NOT NULL,
    "sub_batch_id" INTEGER,
    "category" TEXT NOT NULL,
    "pieces" INTEGER NOT NULL,

    CONSTRAINT "sub_batch_size_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sub_batch_attachments" (
    "id" SERIAL NOT NULL,
    "sub_batch_id" INTEGER,
    "attachment_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "sub_batch_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sub_batch_rejected" (
    "id" SERIAL NOT NULL,
    "sub_batch_id" INTEGER,
    "quantity" INTEGER NOT NULL,
    "sent_to_department_id" INTEGER,
    "reason" TEXT NOT NULL,

    CONSTRAINT "sub_batch_rejected_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sub_batch_altered" (
    "id" SERIAL NOT NULL,
    "sub_batch_id" INTEGER,
    "quantity" INTEGER NOT NULL,
    "sent_to_department_id" INTEGER,
    "reason" TEXT NOT NULL,

    CONSTRAINT "sub_batch_altered_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "supervisor" TEXT NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."department_workers" (
    "id" SERIAL NOT NULL,
    "department_id" INTEGER,
    "worker_id" INTEGER,
    "assigned_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."department_sub_batches" (
    "id" SERIAL NOT NULL,
    "department_id" INTEGER,
    "sub_batch_id" INTEGER,

    CONSTRAINT "department_sub_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "vat_pan" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "comment" TEXT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "department_id" INTEGER,
    "wage_type" "public"."WageType" NOT NULL,
    "wage_rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."worker_logs" (
    "id" SERIAL NOT NULL,
    "worker_id" INTEGER,
    "sub_batch_id" INTEGER,
    "quantity" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vendors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "vat_pan" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "comment" TEXT,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."rolls" ADD CONSTRAINT "rolls_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batches" ADD CONSTRAINT "batches_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batches" ADD CONSTRAINT "batches_roll_id_fkey" FOREIGN KEY ("roll_id") REFERENCES "public"."rolls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_batches" ADD CONSTRAINT "sub_batches_roll_id_fkey" FOREIGN KEY ("roll_id") REFERENCES "public"."rolls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_batches" ADD CONSTRAINT "sub_batches_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_batches" ADD CONSTRAINT "sub_batches_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_batch_size_details" ADD CONSTRAINT "sub_batch_size_details_sub_batch_id_fkey" FOREIGN KEY ("sub_batch_id") REFERENCES "public"."sub_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_batch_attachments" ADD CONSTRAINT "sub_batch_attachments_sub_batch_id_fkey" FOREIGN KEY ("sub_batch_id") REFERENCES "public"."sub_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_batch_rejected" ADD CONSTRAINT "sub_batch_rejected_sub_batch_id_fkey" FOREIGN KEY ("sub_batch_id") REFERENCES "public"."sub_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_batch_rejected" ADD CONSTRAINT "sub_batch_rejected_sent_to_department_id_fkey" FOREIGN KEY ("sent_to_department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_batch_altered" ADD CONSTRAINT "sub_batch_altered_sub_batch_id_fkey" FOREIGN KEY ("sub_batch_id") REFERENCES "public"."sub_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_batch_altered" ADD CONSTRAINT "sub_batch_altered_sent_to_department_id_fkey" FOREIGN KEY ("sent_to_department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."department_workers" ADD CONSTRAINT "department_workers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."department_workers" ADD CONSTRAINT "department_workers_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."department_sub_batches" ADD CONSTRAINT "department_sub_batches_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."department_sub_batches" ADD CONSTRAINT "department_sub_batches_sub_batch_id_fkey" FOREIGN KEY ("sub_batch_id") REFERENCES "public"."sub_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workers" ADD CONSTRAINT "workers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."worker_logs" ADD CONSTRAINT "worker_logs_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."worker_logs" ADD CONSTRAINT "worker_logs_sub_batch_id_fkey" FOREIGN KEY ("sub_batch_id") REFERENCES "public"."sub_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
