/*
  Warnings:

  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `surname` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "fullname" TEXT,
    "email" TEXT NOT NULL,
    "resume" TEXT,
    "password" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "street_number" TEXT,
    "complement" TEXT
);
INSERT INTO "new_User" ("city", "complement", "country", "email", "fullname", "id", "name", "neighborhood", "password", "resume", "state", "street", "street_number", "surname", "zipcode") SELECT "city", "complement", "country", "email", "fullname", "id", "name", "neighborhood", "password", "resume", "state", "street", "street_number", "surname", "zipcode" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check("User");
PRAGMA foreign_keys=ON;
