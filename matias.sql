DROP database if EXISTS matias;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-02-2025 a las 19:31:45
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `matias`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `groups`
--
CREATE DATABASE IF NOT EXISTS `matias` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `matias`;

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



CREATE TABLE `groups` (
  `group_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `creator_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `group_members`
--

CREATE TABLE `group_members` (
  `group_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `messages` (
  `message_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `content` text NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `is_group` tinyint(1) DEFAULT 0,
  `status` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `group_message_status` (
  `message_id` BIGINT(20) UNSIGNED NOT NULL,
  `user_id` INT(11) NOT NULL,
  `status` INT(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;




INSERT INTO `users` (`user_id`, `username`, `password`) VALUES
(0, 'user1', 'scrypt:32768:8:1$WEPJFaJjJwPpKXJc$85f45fef7d073181d4993f80178e373349a0c55e791679c7ce00ce2da2612f7cd57ebf437d6cd97f01fc35c6fdaad9197e9bd0d638092c7a59b528074619b69e'),
(1, 'user2', 'scrypt:32768:8:1$YkMZtFeB6CbOWKqm$f09c184d74e48f073c571d45b3efdc42c9570a0b900ec01a4c7eedd7586f4cf2d1a25ea0b24e5ee7f9c869e8c0aee83d5827e30febfdf728df7e71a78375f06b'),
(2, 'user3', 'scrypt:32768:8:1$hTJjwKlJeCthi8up$d86c17cc6169b55eaa1ebbe5ae9f67faabee7a605edf73420722863bb083b194738cde65b2ef96b20c792021313f0bfa7875133106b84e95b88b6a14a4804738'),
(3, 'alanadrianadamski', 'scrypt:32768:8:1$oNRsuQqlApQIS44G$d3662de915ee2be9a1271a418404160dae4e5ffa63f053e90302a91f65dc5e1f3d6c6be84f1692bb4244a870ca830a8617bf553663b9c3c52eaede0a764dfd9c'),
(4, 'matiasianbastero', 'scrypt:32768:8:1$WBC6y0Zy2dIIZU9s$0754ab9a425c76e82d29742df5da748cd7cee07b28c703d3891547d882679c4cb73dc237034d6f5b3c1e5518a97f33c30491b4e065f25e02e611eb66e0fbc26b'),
(5, 'jaumebauza', 'scrypt:32768:8:1$wp0IeOyeoGKcJMWs$f90d1c2fa8750b5a2f7d9c5cb66b0d8731be1817dc36c04e5b56ca2eb3c8adbfda26df76bd8a54dbda761bd2b88f7f8e87eba4543a830f8ccb576a4045ffa00e'),
(6, 'cristofolcomas', 'scrypt:32768:8:1$Al7giKfi0PxzIHOr$8c85322fc734de61d50c95387055cf431993321b0f7f5f49ddbff2f59f9209d6e04bb7ffe8e1740842460d8bd5f19c150fb06525c5e845c39846963ec3e65258'),
(7, 'marccorcoles', 'scrypt:32768:8:1$45w7i250F8em2LOH$e31f09d5d2f3854c194a03b51fd0e1d27c4144e916b8e392fc98608d2cf26f3d7e7a192b0e0e8e294bdbadbbd0f0cfc29a4a44fb0e10ad8e19031058ed5f9321'),
(8, 'joancortes', 'scrypt:32768:8:1$xjfkMTQUJDiqGwl3$72cf0a680b1a0bf27a05f4168f639ebc39a0b354fa0aac9843ccf7313db39f007f6f2481b42271f64ddea790151f7f72e4223272db1393d98c81998218e1ceb0'),
(9, 'paucortes1', 'scrypt:32768:8:1$m2fpq3SiDbEM7Wqc$07e9f2d62850cf39516e5ce6978c98143460b8cfb51bc5147b9fdc0883a7d4aac3cfac00eeab2f2608e43b1ab74cf44ad185838cc7c842ab4abdb93eb0c3ea45'),
(10, 'rubenespinar', 'scrypt:32768:8:1$ItKEBt7nwWfvQbyU$e322876e746b1cc0c8739d9a6434dd42103ef2731d73a0cff40f24f6b6b08033b1f792cf8af6859f8843399e16bfdf7e2abfa84a03761a0c3c98f9fa1e9e8820'),
(11, 'miquelgarcia', 'scrypt:32768:8:1$rxOOJJZjtrEeL8sq$35e7354151a9eef3f9d0798e3dcd33669ee21be58c77a2ff801163a5a3b0969ad9176e6e88c0956d71555820a3db0c9d297af6d88e2394e62713806b7082bb0b'),
(12, 'helenagoncalves', 'scrypt:32768:8:1$8MxcDlxAy6VOFIsF$700dee872ef54dcc1db0f3931b6211d111b51d266177a846bd753535d6e3813f13560b62e497e53c5e891ae03d04fb878a92d5ff50e28279df1f44c797429800'),
(13, 'manuelguerrero', 'scrypt:32768:8:1$1xzF1gvSc2rowI7d$70fbe80fa969ff9ef038394aa357f535ad68950cb638ae3584ebd3e45750c404bd64c977b5daefad894f01f709fe8ebcd042245ed4d4b1fa7892522bac9d4506'),
(14, 'virginiajimenez', 'scrypt:32768:8:1$GSjthG0gZio6gDGj$1835fc4d67ccbc7641bb528451d530f1e87d647dbdadaeec68883422e1103363787139ce3c45e9a8427df5b1090cd27449105068a3c9abf65057db7a65abafd5'),
(15, 'cristinalopez', 'scrypt:32768:8:1$JeqIZ3AS9xNnxFyY$72ede924802cc937ef8ef08f1583b9f61d20510943e8ae6be67fa986f721a466ee4fdd1b05e0359f0bab24721111096b920fb20047d58dbf8da4d18611bf9f9d'),
(16, 'ivanmartin', 'scrypt:32768:8:1$DPVYV0vIZID9y6O6$b718e9d6dddccbd220b218196f33cef51cb21825e4bebab777b8b7a0c7cbc10e4a2f6557579f723bf08e7c6de9b5076de8501f8c4ab4a212e746a68235ed83d2'),
(17, 'bartomeumoya', 'scrypt:32768:8:1$YJOXf2RTFpr1feEL$00d550324260bc0f1264320c7c21ad20b693091411c653cc0f7bb641b3eaa432a676db4f0bc811eb2cba29a85cba192f54e88e82e821e57609e48bb863dc4914'),
(18, 'facundonastasi', 'scrypt:32768:8:1$WTPabZLLRZwf4ozJ$e463658a55ec45782bbacc24a4b35272f6bc017af60fe20e6ecac8d6d431a4da4901f340f2535f0a55ec8ccfb08231cc75275fe6112dc1269a06f868d186e4a7'),
(19, 'tomaspayeras', 'scrypt:32768:8:1$PDTxAfneCIFfgoTw$3388d5ac4a28a5a92bf83b1154ef7e0b3428d62ce675a1bc7effa5fd9f293a6bbf3278ba897240bf7ef5f5df9dcb3c359d6df941644621dcfb38bf0768a6c0a7'),
(20, 'danielramon', 'scrypt:32768:8:1$4j9IHKNTZJ5g4gmV$ad765fec3b1e29be5943e6025936ebce50b1bd0e78b2f23fbe2dc0d8325594034637749d0e4c2b45e53172e724b0e8bf16c5c5cff30eeb667d27e63ccb6759d3'),
(21, 'mariaelenarivilla', 'scrypt:32768:8:1$mFhpsoDYIPdmH6bh$e7e4cf76a6b4a277882552f62b6116bc321230554db17ca3ead1070bea4b5db8a715d9ff1993de77448c92c16945ce4ca1fa17ea661a980b4827184d237ceb10'),
(22, 'tomasruiz', 'scrypt:32768:8:1$lPU6ExP9GDdbSxGm$cc97208d77a25caef81444489c38dc893f22af9d52af7dc6c2e974b359d960c0cd492d946236ee082cf33061bb7e2e88f10bf76f868dcbcef654605d0f07222e'),
(23, 'hernanmeliveosandoval', 'scrypt:32768:8:1$Jj2VmxoAshxbnkln$c6974bd5d00e015121d45878f88108281f4d43c1c2fab4c1759a7ca467e6d4bf23716475ae16dc1a133a691fbad20f4f676f1029fb7033ae4e006fa7690137e1'),
(24, 'pereserra', 'scrypt:32768:8:1$DwbISHmY3dECGNbD$233424e703c59369948e69a3b5353a4e71526b39d718031c1be9b03a6ae95dc6755e8e70662d0a5ad6b3cf12f542b4426eefd860bee9fcf49abafd9bde6ab9d3'),
(25, 'sergitomas', 'scrypt:32768:8:1$g3ebvcvG9kavQzFc$05146c167966305c75a8196f13dc7c5504a7491cbd7f1333e41bd66421ec0110f806a77fbc23e7466fa4366de4c6fc81c269e63a17e68fe1facf4b87ffd2fa18'),
(26, 'joanvicens', 'scrypt:32768:8:1$0RKG9sGcO7zed6Zg$74790cfbe32c1705d6c1ad8f2e0a91fc7a135fffc5ebe36d7f75e8c343d755787f53700332e3d5f1e07c1a6132932296e628f2f22ccb02557f0dfb58422ac61e'),
(27, 'yukhangwong', 'scrypt:32768:8:1$bOcaeA1ZRFGmCrqT$a51dbdcf5738fd15c7ceaf5c7bafe3d1ad84fb3aaeae35667c694a1e8d8188cc58b9581992e5f503edf813916a227a7709e9148cf5c9f38e42e28892730ebc0d');

--

-- groups table
ALTER TABLE `groups`
  ADD CONSTRAINT `fk_groups_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

-- group_members table
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`group_id`, `user_id`),
  ADD CONSTRAINT `fk_group_members_group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`group_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_group_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

-- messages table
ALTER TABLE `messages`
  ADD CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;


-- group_message_status table
ALTER TABLE `group_message_status`
  ADD PRIMARY KEY (`message_id`, `user_id`),
  ADD CONSTRAINT `fk_group_message_status_message` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_group_message_status_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;



