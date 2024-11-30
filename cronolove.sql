DROP TABLE IF EXISTS `grawe_page`;
CREATE TABLE `grawe_page` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `couple_name` varchar(255) NOT NULL,
  `images` varchar(2000) NOT NULL,
  `music` varchar(300) NOT NULL,
  `message` varchar(2000) DEFAULT NULL,
  `plan` varchar(35) DEFAULT NULL,
  `started_at` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `grawe_page` WRITE;
UNLOCK TABLES;

DROP TABLE IF EXISTS `grawe_user`;
CREATE TABLE `grawe_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `grawe_user` WRITE;
UNLOCK TABLES;

DROP TABLE IF EXISTS `temp_images`;
CREATE TABLE `temp_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `image_name` varchar(255) NOT NULL,
  `coupleName` varchar(255) DEFAULT NULL,
  `music` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `plan` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `temp_images` WRITE;
UNLOCK TABLES;
