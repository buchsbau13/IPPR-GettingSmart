-- MySQL dump 10.13  Distrib 5.7.21, for Linux (x86_64)
--
-- Host: localhost    Database: idm
-- ------------------------------------------------------
-- Server version	5.7.21

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `idm`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `idm` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `idm`;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('201802190000-CreateUserTable.js'),('201802190003-CreateUserRegistrationProfileTable.js'),('201802190005-CreateOrganizationTable.js'),('201802190008-CreateOAuthClientTable.js'),('201802190009-CreateUserAuthorizedApplicationTable.js'),('201802190010-CreateRoleTable.js'),('201802190015-CreatePermissionTable.js'),('201802190020-CreateRoleAssignmentTable.js'),('201802190025-CreateRolePermissionTable.js'),('201802190030-CreateUserOrganizationTable.js'),('201802190035-CreateIotTable.js'),('201802190040-CreatePepProxyTable.js'),('201802190045-CreateAuthZForceTable.js'),('201802190050-CreateAuthTokenTable.js'),('201802190060-CreateOAuthAuthorizationCodeTable.js'),('201802190065-CreateOAuthAccessTokenTable.js'),('201802190070-CreateOAuthRefreshTokenTable.js'),('201802190075-CreateOAuthScopeTable.js'),('20180405125424-CreateUserTourAttribute.js'),('20180612134640-CreateEidasTable.js'),('20180727101745-CreateUserEidasIdAttribute.js'),('20180730094347-CreateTrustedApplicationsTable.js'),('20180828133454-CreatePasswordSalt.js'),('20180913140934-CreateOauthTokenType.js'),('20180921104653-CreateEidasNifColumn.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_token`
--

DROP TABLE IF EXISTS `auth_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_token` (
  `access_token` varchar(255) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `valid` tinyint(1) DEFAULT NULL,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `pep_proxy_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`access_token`),
  UNIQUE KEY `access_token` (`access_token`),
  KEY `user_id` (`user_id`),
  KEY `pep_proxy_id` (`pep_proxy_id`),
  CONSTRAINT `auth_token_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `auth_token_ibfk_2` FOREIGN KEY (`pep_proxy_id`) REFERENCES `pep_proxy` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_token`
--

LOCK TABLES `auth_token` WRITE;
/*!40000 ALTER TABLE `auth_token` DISABLE KEYS */;
INSERT INTO `auth_token` VALUES ('035003c8-ada8-4131-8052-323d3e666274','2018-10-28 15:10:41',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('0673c07a-8e47-416b-9c75-b2266ed7a3a2','2018-10-28 15:46:22',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('0a6226e3-d31c-4497-8336-ae421b531312','2018-10-28 11:29:11',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('11e5a1d4-9187-4e04-81c9-0c0775d84212','2018-10-28 15:43:23',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('12898808-aa2e-4090-b1ae-c68a9516f0ce','2018-10-28 13:47:57',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('2587447e-9541-4ce1-bd8c-8e09d89c131f','2018-10-28 15:10:41',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('28de03b7-4db7-4fba-8d25-19027ce1c3dc','2018-10-28 15:06:15',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('2fc14f68-ccd8-434a-bab4-ef41cfb0dbaa','2018-10-27 19:02:18',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('393a279a-8342-4aef-8a9d-e67ca979575a','2018-10-28 11:29:11',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('3c5e349f-d2d9-4c0a-ac6c-28b4ad6602a7','2018-10-28 16:04:35',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('543b062f-b8ac-4cfa-81c5-7c8df900f2da','2018-10-28 15:39:31',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('59309c6a-7e06-4289-ac9e-1679eff291b6','2018-10-28 15:39:31',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('5a51a880-4936-4659-bbe1-dc5c3fc3a0de','2018-10-27 19:59:29',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('5a800759-178d-4b23-9aab-e8dd7089e5ea','2018-10-28 15:06:15',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('5b936b16-a88e-4e41-ba38-8a2c0af183aa','2018-10-27 19:59:29',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('5d6f456a-857a-48f5-9c89-28c4ba8bada0','2018-10-28 15:39:31',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('5dfc84ad-7248-4597-8efa-4bfa28d915d6','2018-10-27 20:01:28',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('6dde8713-fe96-4a94-9038-427a86dcbf77','2018-10-27 19:34:34',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('6ef8c045-0748-4138-bc3c-ac31fd00b6f5','2018-10-27 19:59:29',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('6f3cd7bf-0d1d-44a0-a7fe-8eccba370dce','2018-10-27 19:28:26',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('719cc06d-540b-4dba-b30e-cfe0b99aa221','2018-10-28 15:10:40',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('72195e0f-b02d-45b3-8a24-5d7db9895640','2018-10-27 19:28:26',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('76e69137-8e0b-4bca-8438-37c91480c42f','2018-10-28 13:47:57',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('790ee3e8-ccfa-4267-8dc6-d14eb9dc9345','2018-10-28 11:29:11',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('7ec4f0c4-12e0-4e31-a948-a98e2f264067','2018-10-27 19:34:35',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('8b26c8db-35e3-4025-af4b-bcbc31166f8f','2018-10-27 19:34:35',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('9576553a-151d-406d-a60b-e1dc7fd970d7','2018-10-28 15:39:31',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('98453859-bc14-42e8-98e5-7432babf298c','2018-10-28 15:43:23',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('9c125a5b-8135-44e0-a103-1adaf36af05f','2018-10-28 11:29:11',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('9f3bb25d-a5c0-4bff-aa5d-65c7584e9f8a','2018-10-27 19:14:20',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('a2b5132d-5ead-4c98-970d-c63bf4ae2d09','2018-10-27 19:59:29',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('a4ab1966-4c3c-4f29-a414-ad5786f9459d','2018-10-27 19:14:20',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('ad79cce8-5d97-4506-b795-e5a60a69c484','2018-10-28 15:10:41',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('ada4818e-1398-4246-b26a-2de7a7534d8b','2018-10-28 13:47:57',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('b3480ab3-d489-499d-adce-6f88da55f380','2018-10-27 20:01:28',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('b6f2b9dd-e802-4caf-9671-1f91383f893f','2018-10-27 19:28:26',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('bc82b43a-4479-4e1a-b97b-f5eb72f16c20','2018-10-28 15:43:23',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('c2f53d64-7cdb-4a7f-83e4-6369d9993d9b','2018-10-27 19:34:35',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('c36dcfac-4745-4c38-9555-0be8284a611a','2018-10-28 16:04:34',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('cb3de35d-65cd-48d4-8a8f-9e7a6509b66d','2018-10-28 15:46:22',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('d7fd9e7d-c46a-4728-82f8-d735c01f89be','2018-10-28 15:06:15',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('dfdfe945-e866-4a4f-a8b5-a801dca85430','2018-10-27 19:28:26',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('e1cd2643-e4c1-4962-8eed-3bbdca111564','2018-10-27 19:14:20',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('e242e180-4c2e-4838-ad46-fa5fd8f38f6a','2018-10-28 13:47:57',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('e3528453-0090-482d-90d5-bcf875d2e2a1','2018-10-28 16:04:35',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('e36d8b9f-a8ba-47e2-9ad2-1e5f43adc9ea','2018-10-28 15:46:22',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('e4dd59df-16e9-4a68-a416-d783bfe61e29','2018-10-27 20:01:28',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('e8e50c3c-20d8-42a4-a6c4-4e52de316a11','2018-10-28 15:43:23',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('f2a7b7f2-fd68-4f16-b677-66c3b9e5bc5b','2018-10-27 19:02:18',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('f2b64007-9245-44cd-a8d3-5a2b1a28d5cf','2018-10-28 15:06:15',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('f3817082-e296-4de7-8eb7-ece139130ecc','2018-10-27 19:02:18',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('f9f4f3a2-80ef-4d02-b0bd-f8f0a7462b8d','2018-10-28 15:46:22',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('faf5fbea-bbab-4b18-b197-3f73b3c249f4','2018-10-27 20:01:28',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('fe5e6573-ac0c-4e0f-b38d-6ca8223f43cb','2018-10-28 16:04:35',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6');
/*!40000 ALTER TABLE `auth_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authzforce`
--

DROP TABLE IF EXISTS `authzforce`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `authzforce` (
  `az_domain` varchar(255) NOT NULL,
  `policy` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `version` int(11) DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`az_domain`),
  KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `authzforce_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authzforce`
--

LOCK TABLES `authzforce` WRITE;
/*!40000 ALTER TABLE `authzforce` DISABLE KEYS */;
INSERT INTO `authzforce` VALUES ('vuBNANoREeiDKwJCrBoAAg','97c490a2-0d91-430e-af05-588825ddef66',2,'23c1fab4-2f69-470d-8778-4614522d29d3');
/*!40000 ALTER TABLE `authzforce` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eidas_credentials`
--

DROP TABLE IF EXISTS `eidas_credentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eidas_credentials` (
  `id` char(36) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `support_contact_person_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `support_contact_person_surname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `support_contact_person_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `support_contact_person_telephone_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `support_contact_person_company` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `technical_contact_person_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `technical_contact_person_surname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `technical_contact_person_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `technical_contact_person_telephone_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `technical_contact_person_company` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organization_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organization_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `organization_nif` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `eidas_credentials_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eidas_credentials`
--

LOCK TABLES `eidas_credentials` WRITE;
/*!40000 ALTER TABLE `eidas_credentials` DISABLE KEYS */;
/*!40000 ALTER TABLE `eidas_credentials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iot`
--

DROP TABLE IF EXISTS `iot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `iot` (
  `id` varchar(255) NOT NULL,
  `password` varchar(40) DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `salt` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `iot_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iot`
--

LOCK TABLES `iot` WRITE;
/*!40000 ALTER TABLE `iot` DISABLE KEYS */;
/*!40000 ALTER TABLE `iot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_access_token`
--

DROP TABLE IF EXISTS `oauth_access_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_access_token` (
  `access_token` varchar(255) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `valid` tinyint(1) DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `iot_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`access_token`),
  UNIQUE KEY `access_token` (`access_token`),
  KEY `oauth_client_id` (`oauth_client_id`),
  KEY `user_id` (`user_id`),
  KEY `iot_id` (`iot_id`),
  CONSTRAINT `oauth_access_token_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE,
  CONSTRAINT `oauth_access_token_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `oauth_access_token_ibfk_3` FOREIGN KEY (`iot_id`) REFERENCES `iot` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_access_token`
--

LOCK TABLES `oauth_access_token` WRITE;
/*!40000 ALTER TABLE `oauth_access_token` DISABLE KEYS */;
INSERT INTO `oauth_access_token` VALUES ('76a2898307ff90bc67529ab152001de6b1dc1661','2018-10-27 21:15:49',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('ef8323c30698c8c3ffe46383c17867c3eba2ed45','2018-10-28 13:40:54',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','7b43faa9-12f7-46a7-a28e-9f1c4a2633b9',NULL),('fd077b868b21e12b1e6c1f287dd15acd99a813d3','2018-10-27 19:48:01',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL);
/*!40000 ALTER TABLE `oauth_access_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_authorization_code`
--

DROP TABLE IF EXISTS `oauth_authorization_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_authorization_code` (
  `authorization_code` varchar(256) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `redirect_uri` varchar(2000) DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `valid` tinyint(1) DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`authorization_code`),
  UNIQUE KEY `authorization_code` (`authorization_code`),
  KEY `oauth_client_id` (`oauth_client_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `oauth_authorization_code_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE,
  CONSTRAINT `oauth_authorization_code_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_authorization_code`
--

LOCK TABLES `oauth_authorization_code` WRITE;
/*!40000 ALTER TABLE `oauth_authorization_code` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_authorization_code` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_client`
--

DROP TABLE IF EXISTS `oauth_client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_client` (
  `id` char(36) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `secret` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `url` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `redirect_uri` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) DEFAULT 'default',
  `grant_type` varchar(255) DEFAULT NULL,
  `response_type` varchar(255) DEFAULT NULL,
  `client_type` varchar(15) DEFAULT NULL,
  `scope` varchar(80) DEFAULT NULL,
  `extra` json DEFAULT NULL,
  `token_type` varchar(15) DEFAULT 'bearer',
  `jwt_secret` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_client`
--

LOCK TABLES `oauth_client` WRITE;
/*!40000 ALTER TABLE `oauth_client` DISABLE KEYS */;
INSERT INTO `oauth_client` VALUES ('23c1fab4-2f69-470d-8778-4614522d29d3','WireCloud','WireCloud','0b9194f0-f74a-4717-9222-170e9e473bf4','http://localhost','http://localhost/complete/fiware/ ','default','authorization_code,implicit,password,client_credentials,refresh_token','code,token',NULL,NULL,NULL,'bearer',NULL),('idm_admin_app','idm','idm',NULL,'','','default','','',NULL,NULL,NULL,'bearer',NULL);
/*!40000 ALTER TABLE `oauth_client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_refresh_token`
--

DROP TABLE IF EXISTS `oauth_refresh_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_refresh_token` (
  `refresh_token` varchar(256) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `iot_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`refresh_token`),
  UNIQUE KEY `refresh_token` (`refresh_token`),
  KEY `oauth_client_id` (`oauth_client_id`),
  KEY `user_id` (`user_id`),
  KEY `iot_id` (`iot_id`),
  CONSTRAINT `oauth_refresh_token_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE,
  CONSTRAINT `oauth_refresh_token_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `oauth_refresh_token_ibfk_3` FOREIGN KEY (`iot_id`) REFERENCES `iot` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_refresh_token`
--

LOCK TABLES `oauth_refresh_token` WRITE;
/*!40000 ALTER TABLE `oauth_refresh_token` DISABLE KEYS */;
INSERT INTO `oauth_refresh_token` VALUES ('1ef38ad4f09b901318dbd30ae43092b18a3296ef','2018-11-10 21:15:49',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('49c4e6738d02211e69cfdc48c9a3b37c819466bc','2018-11-11 12:40:54',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','7b43faa9-12f7-46a7-a28e-9f1c4a2633b9',NULL),('870ad4cbea96103edeca41d2afd70cc4886e08f6','2018-11-10 19:48:01',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL);
/*!40000 ALTER TABLE `oauth_refresh_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_scope`
--

DROP TABLE IF EXISTS `oauth_scope`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `oauth_scope` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `scope` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_scope`
--

LOCK TABLES `oauth_scope` WRITE;
/*!40000 ALTER TABLE `oauth_scope` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_scope` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization`
--

DROP TABLE IF EXISTS `organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organization` (
  `id` char(36) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `website` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) DEFAULT 'default',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization`
--

LOCK TABLES `organization` WRITE;
/*!40000 ALTER TABLE `organization` DISABLE KEYS */;
/*!40000 ALTER TABLE `organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pep_proxy`
--

DROP TABLE IF EXISTS `pep_proxy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pep_proxy` (
  `id` varchar(255) NOT NULL,
  `password` varchar(40) DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `salt` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `pep_proxy_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pep_proxy`
--

LOCK TABLES `pep_proxy` WRITE;
/*!40000 ALTER TABLE `pep_proxy` DISABLE KEYS */;
INSERT INTO `pep_proxy` VALUES ('pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6','218eef2284bba418b2ecfb6c46a35e3a3197f5c1','23c1fab4-2f69-470d-8778-4614522d29d3','2c950778579a0ccb');
/*!40000 ALTER TABLE `pep_proxy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permission` (
  `id` char(36) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_internal` tinyint(1) DEFAULT '0',
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resource` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `xml` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `permission_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES ('1','Get and assign all internal application roles',NULL,1,NULL,NULL,NULL,'idm_admin_app'),('2','Manage the application',NULL,1,NULL,NULL,NULL,'idm_admin_app'),('3','Manage roles',NULL,1,NULL,NULL,NULL,'idm_admin_app'),('316f6e3d-ca4a-40ea-9029-7918f00c3c62','Create Entities','Create Entities',0,'POST','/v2/entities','','23c1fab4-2f69-470d-8778-4614522d29d3'),('4','Manage authorizations',NULL,1,NULL,NULL,NULL,'idm_admin_app'),('5','Get and assign all public application roles',NULL,1,NULL,NULL,NULL,'idm_admin_app'),('6','Get and assign only public owned roles',NULL,1,NULL,NULL,NULL,'idm_admin_app'),('a00e6338-dfeb-4461-974c-e857ed300f1b','Get Entities','Get Entities',0,'GET','/v2/entities','','23c1fab4-2f69-470d-8778-4614522d29d3'),('d8457cea-eae9-45be-966e-e1fe94deafd5','Delete Entities','Delete Entities',0,'DELETE','/v2/entities','','23c1fab4-2f69-470d-8778-4614522d29d3');
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id` char(36) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_internal` tinyint(1) DEFAULT '0',
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `role_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES ('b61ec9a9-9703-4eb3-ac86-3d334e2286a1','Data Manager',0,'23c1fab4-2f69-470d-8778-4614522d29d3'),('provider','Provider',1,'idm_admin_app'),('purchaser','Purchaser',1,'idm_admin_app');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_assignment`
--

DROP TABLE IF EXISTS `role_assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_assignment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_organization` varchar(255) DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `role_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `organization_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  KEY `role_id` (`role_id`),
  KEY `organization_id` (`organization_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `role_assignment_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_assignment_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_assignment_ibfk_3` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_assignment_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_assignment`
--

LOCK TABLES `role_assignment` WRITE;
/*!40000 ALTER TABLE `role_assignment` DISABLE KEYS */;
INSERT INTO `role_assignment` VALUES (6,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','provider',NULL,'salho'),(7,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','b61ec9a9-9703-4eb3-ac86-3d334e2286a1',NULL,'salho'),(8,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','b61ec9a9-9703-4eb3-ac86-3d334e2286a1',NULL,'7b43faa9-12f7-46a7-a28e-9f1c4a2633b9');
/*!40000 ALTER TABLE `role_assignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permission`
--

DROP TABLE IF EXISTS `role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `permission_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `role_id` (`role_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permission_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission`
--

LOCK TABLES `role_permission` WRITE;
/*!40000 ALTER TABLE `role_permission` DISABLE KEYS */;
INSERT INTO `role_permission` VALUES (1,'provider','1'),(2,'provider','2'),(3,'provider','3'),(4,'provider','4'),(5,'provider','5'),(6,'provider','6'),(7,'purchaser','5'),(10,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','316f6e3d-ca4a-40ea-9029-7918f00c3c62'),(11,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','d8457cea-eae9-45be-966e-e1fe94deafd5'),(12,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','a00e6338-dfeb-4461-974c-e857ed300f1b');
/*!40000 ALTER TABLE `role_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trusted_application`
--

DROP TABLE IF EXISTS `trusted_application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trusted_application` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `trusted_oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  KEY `trusted_oauth_client_id` (`trusted_oauth_client_id`),
  CONSTRAINT `trusted_application_ibfk_1` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trusted_application_ibfk_2` FOREIGN KEY (`trusted_oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trusted_application`
--

LOCK TABLES `trusted_application` WRITE;
/*!40000 ALTER TABLE `trusted_application` DISABLE KEYS */;
/*!40000 ALTER TABLE `trusted_application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` char(36) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `website` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) DEFAULT 'default',
  `gravatar` tinyint(1) DEFAULT '0',
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(40) DEFAULT NULL,
  `date_password` datetime DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT '0',
  `admin` tinyint(1) DEFAULT '0',
  `extra` varchar(255) DEFAULT NULL,
  `scope` varchar(80) DEFAULT NULL,
  `starters_tour_ended` tinyint(1) DEFAULT '0',
  `eidas_id` varchar(255) DEFAULT NULL,
  `salt` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('7b43faa9-12f7-46a7-a28e-9f1c4a2633b9','johnny',NULL,NULL,'default',0,'jd@test.com','bcfa63aa5b5ebab68c7c4a520a29821e8162452c','2018-10-28 12:26:41',1,0,NULL,NULL,0,NULL,'362e08b6c216e34d'),('admin','admin',NULL,NULL,'default',0,'admin@test.com','02ed617302f0656fc8cd02b6556cb6f612cea10f','2018-10-27 17:40:55',1,1,NULL,NULL,0,NULL,'b83eaa64f7ddf7ce'),('salho','salho',NULL,NULL,'default',0,'peter.salhofer@fh-joanneum.at','577dae600f801e8fd8136221abe238d972acd873','2018-10-27 17:54:13',1,0,NULL,NULL,1,NULL,'d3a5269999f64214');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_authorized_application`
--

DROP TABLE IF EXISTS `user_authorized_application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_authorized_application` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `oauth_client_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `oauth_client_id` (`oauth_client_id`),
  CONSTRAINT `user_authorized_application_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_authorized_application_ibfk_2` FOREIGN KEY (`oauth_client_id`) REFERENCES `oauth_client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_authorized_application`
--

LOCK TABLES `user_authorized_application` WRITE;
/*!40000 ALTER TABLE `user_authorized_application` DISABLE KEYS */;
INSERT INTO `user_authorized_application` VALUES (1,'salho','23c1fab4-2f69-470d-8778-4614522d29d3'),(2,'7b43faa9-12f7-46a7-a28e-9f1c4a2633b9','23c1fab4-2f69-470d-8778-4614522d29d3');
/*!40000 ALTER TABLE `user_authorized_application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_organization`
--

DROP TABLE IF EXISTS `user_organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_organization` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(10) DEFAULT NULL,
  `user_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `organization_id` char(36) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `user_organization_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_organization_ibfk_2` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_organization`
--

LOCK TABLES `user_organization` WRITE;
/*!40000 ALTER TABLE `user_organization` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_registration_profile`
--

DROP TABLE IF EXISTS `user_registration_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_registration_profile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `activation_key` varchar(255) DEFAULT NULL,
  `activation_expires` datetime DEFAULT NULL,
  `reset_key` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `verification_key` varchar(255) DEFAULT NULL,
  `verification_expires` datetime DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_email` (`user_email`),
  CONSTRAINT `user_registration_profile_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `user` (`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_registration_profile`
--

LOCK TABLES `user_registration_profile` WRITE;
/*!40000 ALTER TABLE `user_registration_profile` DISABLE KEYS */;
INSERT INTO `user_registration_profile` VALUES (1,'icu6nam6f79','2018-10-28 17:54:13',NULL,NULL,NULL,NULL,'peter.salhofer@fh-joanneum.at'),(2,'nqztfsy61ym','2018-10-29 12:26:41',NULL,NULL,NULL,NULL,'jd@test.com');
/*!40000 ALTER TABLE `user_registration_profile` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-10-28 15:15:00
