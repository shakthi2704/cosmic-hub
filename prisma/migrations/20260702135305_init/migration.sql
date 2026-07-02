-- CreateEnum
CREATE TYPE "CelestialType" AS ENUM ('PLANET', 'DWARF_PLANET', 'MOON', 'STAR', 'GALAXY', 'NEBULA', 'BLACK_HOLE', 'ASTEROID', 'COMET', 'EXOPLANET', 'OTHER');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('FLYBY', 'ORBITER', 'LANDER', 'ROVER', 'CREWED', 'TELESCOPE', 'PROBE', 'OTHER');

-- CreateEnum
CREATE TYPE "AgencyType" AS ENUM ('GOVERNMENT', 'PRIVATE', 'INTERNATIONAL', 'RESEARCH');

-- CreateEnum
CREATE TYPE "PersonRole" AS ENUM ('ASTRONAUT', 'COSMONAUT', 'SCIENTIST', 'ENGINEER', 'DIRECTOR', 'OTHER');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('ORBITS', 'HOSTED_BY', 'PART_OF', 'COMPANION', 'DISCOVERED');

-- CreateTable
CREATE TABLE "celestial_objects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CelestialType" NOT NULL,
    "summary" TEXT,
    "attributes" JSONB,
    "imageUrl" TEXT,
    "massKg" DOUBLE PRECISION,
    "radiusKm" DOUBLE PRECISION,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "celestial_objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "countryCode" TEXT,
    "type" "AgencyType" NOT NULL,
    "websiteUrl" TEXT,
    "description" TEXT,
    "foundedYear" INTEGER,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "MissionStatus" NOT NULL,
    "missionType" "MissionType" NOT NULL,
    "launchDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "wikiUrl" TEXT,
    "agencyId" TEXT,
    "targetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "PersonRole" NOT NULL,
    "nationality" TEXT,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "bio" TEXT,
    "imageUrl" TEXT,
    "agencyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_crew" (
    "missionId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "roleOnMission" TEXT,

    CONSTRAINT "mission_crew_pkey" PRIMARY KEY ("missionId","personId")
);

-- CreateTable
CREATE TABLE "object_relations" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "relationType" "RelationType" NOT NULL,
    "note" TEXT,

    CONSTRAINT "object_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taggables" (
    "tagId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,

    CONSTRAINT "taggables_pkey" PRIMARY KEY ("tagId","entityType","entityId")
);

-- CreateIndex
CREATE UNIQUE INDEX "celestial_objects_slug_key" ON "celestial_objects"("slug");

-- CreateIndex
CREATE INDEX "celestial_objects_type_idx" ON "celestial_objects"("type");

-- CreateIndex
CREATE INDEX "celestial_objects_slug_idx" ON "celestial_objects"("slug");

-- CreateIndex
CREATE INDEX "celestial_objects_parentId_idx" ON "celestial_objects"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "agencies_slug_key" ON "agencies"("slug");

-- CreateIndex
CREATE INDEX "agencies_countryCode_idx" ON "agencies"("countryCode");

-- CreateIndex
CREATE INDEX "agencies_type_idx" ON "agencies"("type");

-- CreateIndex
CREATE UNIQUE INDEX "missions_slug_key" ON "missions"("slug");

-- CreateIndex
CREATE INDEX "missions_status_idx" ON "missions"("status");

-- CreateIndex
CREATE INDEX "missions_missionType_idx" ON "missions"("missionType");

-- CreateIndex
CREATE INDEX "missions_agencyId_idx" ON "missions"("agencyId");

-- CreateIndex
CREATE INDEX "missions_targetId_idx" ON "missions"("targetId");

-- CreateIndex
CREATE INDEX "missions_launchDate_idx" ON "missions"("launchDate");

-- CreateIndex
CREATE UNIQUE INDEX "people_slug_key" ON "people"("slug");

-- CreateIndex
CREATE INDEX "people_role_idx" ON "people"("role");

-- CreateIndex
CREATE INDEX "people_nationality_idx" ON "people"("nationality");

-- CreateIndex
CREATE INDEX "people_agencyId_idx" ON "people"("agencyId");

-- CreateIndex
CREATE INDEX "object_relations_fromId_idx" ON "object_relations"("fromId");

-- CreateIndex
CREATE INDEX "object_relations_toId_idx" ON "object_relations"("toId");

-- CreateIndex
CREATE UNIQUE INDEX "object_relations_fromId_toId_relationType_key" ON "object_relations"("fromId", "toId", "relationType");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "taggables_entityType_entityId_idx" ON "taggables"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "celestial_objects" ADD CONSTRAINT "celestial_objects_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "celestial_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "celestial_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_crew" ADD CONSTRAINT "mission_crew_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_crew" ADD CONSTRAINT "mission_crew_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_relations" ADD CONSTRAINT "object_relations_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "celestial_objects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_relations" ADD CONSTRAINT "object_relations_toId_fkey" FOREIGN KEY ("toId") REFERENCES "celestial_objects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taggables" ADD CONSTRAINT "taggables_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
