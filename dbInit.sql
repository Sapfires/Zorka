-- --------------------------------------------------------
-- Хост:                         127.0.0.1
-- Версия сервера:               8.0.40 - MySQL Community Server - GPL
-- Операционная система:         Win64
-- HeidiSQL Версия:              12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Дамп структуры базы данных test1
CREATE DATABASE IF NOT EXISTS `test1` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `test1`;

-- Дамп структуры для таблица test1.master_details
CREATE TABLE IF NOT EXISTS `master_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `rate_of_salary` decimal(10,2) DEFAULT NULL,
  `work_experience` int DEFAULT NULL,
  `brief_information` text,
  `working_hours` varchar(255) NOT NULL DEFAULT '09:00-18:00',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `master_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы test1.master_details: ~1 rows (приблизительно)
INSERT INTO `master_details` (`id`, `user_id`, `first_name`, `last_name`, `rate_of_salary`, `work_experience`, `brief_information`, `working_hours`) VALUES
	(1, 5, 'John', 'Doe', 6000.00, 10, 'Experienced hair stylist specializing in modern cuts and coloring.', '09:00-18:00');

-- Дамп структуры для таблица test1.master_services
CREATE TABLE IF NOT EXISTS `master_services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `master_id` int NOT NULL,
  `service_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `master_id` (`master_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `master_services_ibfk_1` FOREIGN KEY (`master_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `master_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы test1.master_services: ~1 rows (приблизительно)
INSERT INTO `master_services` (`id`, `master_id`, `service_id`) VALUES
	(1, 5, 1);

-- Дамп структуры для таблица test1.salon_settings
CREATE TABLE IF NOT EXISTS `salon_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `open_time` time NOT NULL,
  `close_time` time NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы test1.salon_settings: ~1 rows (приблизительно)
INSERT INTO `salon_settings` (`id`, `phone`, `email`, `open_time`, `close_time`) VALUES
	(1, '+1234567890', 'contact@salon.com', '09:00:00', '20:00:00');

-- Дамп структуры для таблица test1.schedule
CREATE TABLE IF NOT EXISTS `schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_id` int NOT NULL,
  `client_id` int NOT NULL,
  `master_id` int NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `service_id` (`service_id`),
  KEY `client_id` (`client_id`),
  KEY `master_id` (`master_id`),
  CONSTRAINT `schedule_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  CONSTRAINT `schedule_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `schedule_ibfk_3` FOREIGN KEY (`master_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы test1.schedule: ~1 rows (приблизительно)
INSERT INTO `schedule` (`id`, `service_id`, `client_id`, `master_id`, `start_time`, `end_time`, `description`) VALUES
	(1, 1, 2, 5, '2025-01-03 10:00:00', '2025-01-03 10:30:00', 'cuts like knife');

-- Дамп структуры для таблица test1.services
CREATE TABLE IF NOT EXISTS `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `photo` text,
  `description` text,
  `duration` int NOT NULL DEFAULT '60',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы test1.services: ~2 rows (приблизительно)
INSERT INTO `services` (`id`, `name`, `price`, `photo`, `description`, `duration`) VALUES
	(1, 'haircut', 15.00, NULL, 'for every you', 30),
	(2, 'coloring', 20.00, NULL, 'for every you', 60);

-- Дамп структуры для таблица test1.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `login` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `photo` text,
  `role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Дамп данных таблицы test1.users: ~5 rows (приблизительно)
INSERT INTO `users` (`id`, `login`, `password`, `phone_number`, `photo`, `role`) VALUES
	(1, 'newuser123', 'newPassword123', NULL, NULL, 'ADMIN'),
	(2, 'newuser124', 'newPassword123', '12345', NULL, 'CLIENT'),
	(3, 'newuser125', 'newPassword123', NULL, NULL, 'CLIENT'),
	(4, 'newuser126', 'newPassword123', NULL, NULL, 'CLIENT'),
	(5, 'master123', 'securePassword', NULL, NULL, 'MASTER');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
