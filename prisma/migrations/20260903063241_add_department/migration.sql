-- CreateTable
CREATE TABLE `tbl_departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tbl_departments_department_name_key`(`department_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable (add nullable first so we can backfill existing rows)
ALTER TABLE `tbl_ticket` ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `department_id` INTEGER NULL;

-- Backfill existing tickets with a placeholder department before enforcing NOT NULL
UPDATE `tbl_ticket` SET `department` = 'IT' WHERE `department` IS NULL;

-- Now enforce the required constraint
ALTER TABLE `tbl_ticket` MODIFY COLUMN `department` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `tbl_users` ADD COLUMN `department_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `tbl_users_rules` ADD COLUMN `add_department` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `delete_department` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `edit_department` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `list_department` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `scope_to_department` INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE `tbl_users` ADD CONSTRAINT `tbl_users_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `tbl_departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_ticket` ADD CONSTRAINT `tbl_ticket_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `tbl_departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
