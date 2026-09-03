-- CreateTable
CREATE TABLE `tbl_users` (
    `users_id` INTEGER NOT NULL AUTO_INCREMENT,
    `users_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `code` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL,
    `rules_id` INTEGER NULL,
    `company` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tbl_users_email_key`(`email`),
    PRIMARY KEY (`users_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_users_rules` (
    `rules_id` INTEGER NOT NULL AUTO_INCREMENT,
    `rules_name` VARCHAR(191) NOT NULL,
    `add_user_status` INTEGER NOT NULL DEFAULT 0,
    `edit_user_status` INTEGER NOT NULL DEFAULT 0,
    `delete_user_status` INTEGER NOT NULL DEFAULT 0,
    `list_user_status` INTEGER NOT NULL DEFAULT 0,
    `add_ticket_status` INTEGER NOT NULL DEFAULT 0,
    `edit_ticket_status` INTEGER NOT NULL DEFAULT 0,
    `delete_ticket_status` INTEGER NOT NULL DEFAULT 0,
    `list_ticket_status` INTEGER NOT NULL DEFAULT 0,
    `list_ticket_assign` INTEGER NOT NULL DEFAULT 0,
    `add_user_rules` INTEGER NOT NULL DEFAULT 0,
    `edit_user_rules` INTEGER NOT NULL DEFAULT 0,
    `delete_user_rules` INTEGER NOT NULL DEFAULT 0,
    `list_user_rules` INTEGER NOT NULL DEFAULT 0,
    `add_station` INTEGER NOT NULL DEFAULT 0,
    `edit_station` INTEGER NOT NULL DEFAULT 0,
    `delete_station` INTEGER NOT NULL DEFAULT 0,
    `list_station` INTEGER NOT NULL DEFAULT 0,
    `list_dashboard` INTEGER NOT NULL DEFAULT 1,
    `list_track` INTEGER NOT NULL DEFAULT 1,
    `list_report` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`rules_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticket_id` VARCHAR(191) NOT NULL,
    `user_create_ticket` INTEGER NOT NULL,
    `users_id` INTEGER NULL,
    `station_id` VARCHAR(191) NOT NULL,
    `station_name` VARCHAR(191) NOT NULL,
    `station_type` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `issue_type` VARCHAR(191) NOT NULL,
    `issue_type_id` INTEGER NULL,
    `issue_description` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Open',
    `comment` TEXT NULL,
    `ticket_open` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ticket_on_hold` DATETIME(3) NULL,
    `ticket_in_progress` DATETIME(3) NULL,
    `ticket_pending_vendor` DATETIME(3) NULL,
    `ticket_close` DATETIME(3) NULL,
    `ticket_time` DATETIME(3) NULL,
    `SLA_category` VARCHAR(191) NULL,

    UNIQUE INDEX `tbl_ticket_ticket_id_key`(`ticket_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_ticket_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticket_id` VARCHAR(191) NOT NULL,
    `image_path` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_station` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `station_id` VARCHAR(191) NOT NULL,
    `station_name` VARCHAR(191) NOT NULL,
    `station_type` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tbl_station_station_id_key`(`station_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_user_image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `users_id` INTEGER NOT NULL,
    `image_path` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tbl_user_image_users_id_key`(`users_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_issue_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `issue_type` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tbl_issue_types_issue_type_category_key`(`issue_type`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_telegramgroups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` VARCHAR(191) NOT NULL,
    `group_name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tbl_telegramgroups_group_id_key`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_telegrambots` (
    `bot_id` INTEGER NOT NULL AUTO_INCREMENT,
    `bot_name` VARCHAR(191) NOT NULL,
    `bot_token` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tbl_telegrambots_bot_name_key`(`bot_name`),
    PRIMARY KEY (`bot_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_user_groups` (
    `users_id` INTEGER NOT NULL,
    `group_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`users_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tbl_users` ADD CONSTRAINT `tbl_users_rules_id_fkey` FOREIGN KEY (`rules_id`) REFERENCES `tbl_users_rules`(`rules_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_ticket` ADD CONSTRAINT `tbl_ticket_user_create_ticket_fkey` FOREIGN KEY (`user_create_ticket`) REFERENCES `tbl_users`(`users_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_ticket` ADD CONSTRAINT `tbl_ticket_users_id_fkey` FOREIGN KEY (`users_id`) REFERENCES `tbl_users`(`users_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_ticket` ADD CONSTRAINT `tbl_ticket_issue_type_id_fkey` FOREIGN KEY (`issue_type_id`) REFERENCES `tbl_issue_types`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_ticket_images` ADD CONSTRAINT `tbl_ticket_images_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tbl_ticket`(`ticket_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_user_image` ADD CONSTRAINT `tbl_user_image_users_id_fkey` FOREIGN KEY (`users_id`) REFERENCES `tbl_users`(`users_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_user_groups` ADD CONSTRAINT `tbl_user_groups_users_id_fkey` FOREIGN KEY (`users_id`) REFERENCES `tbl_users`(`users_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tbl_user_groups` ADD CONSTRAINT `tbl_user_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `tbl_telegramgroups`(`group_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
