-- AlterTable: Add 'absent' to user_work_log_status enum
ALTER TABLE `user_work_log` MODIFY COLUMN `status` ENUM('scheduled', 'working', 'done', 'settled', 'absent') NULL;
