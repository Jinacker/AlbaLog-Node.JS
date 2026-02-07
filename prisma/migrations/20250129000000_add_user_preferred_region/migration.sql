-- CreateTable: user_preferred_region (user-region 다대다 관계)
CREATE TABLE `user_preferred_region` (
    `user_id` BINARY(16) NOT NULL,
    `region_id` BINARY(16) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `FK_region_TO_preferred_region`(`region_id`),
    PRIMARY KEY (`user_id`, `region_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_preferred_region` ADD CONSTRAINT `FK_user_TO_preferred_region` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_preferred_region` ADD CONSTRAINT `FK_region_TO_preferred_region` FOREIGN KEY (`region_id`) REFERENCES `region`(`region_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
