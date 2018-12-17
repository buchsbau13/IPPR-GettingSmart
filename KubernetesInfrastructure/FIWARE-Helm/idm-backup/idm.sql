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
INSERT INTO `auth_token` VALUES ('035003c8-ada8-4131-8052-323d3e666274','2018-10-28 15:10:41',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('0673c07a-8e47-416b-9c75-b2266ed7a3a2','2018-10-28 15:46:22',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('0a6226e3-d31c-4497-8336-ae421b531312','2018-10-28 11:29:11',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('11e5a1d4-9187-4e04-81c9-0c0775d84212','2018-10-28 15:43:23',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('12898808-aa2e-4090-b1ae-c68a9516f0ce','2018-10-28 13:47:57',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('12f56c2c-ce7d-413b-8f39-050bf3c98535','2018-10-29 11:07:09',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('20296d1e-4480-4cf3-807b-ce3fbf93bd42','2018-10-29 09:42:30',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('2587447e-9541-4ce1-bd8c-8e09d89c131f','2018-10-28 15:10:41',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('275cffe1-380b-4eea-abb8-fbd18a09a68c','2018-10-30 10:21:17',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('28de03b7-4db7-4fba-8d25-19027ce1c3dc','2018-10-28 15:06:15',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('2b313a23-508c-490b-8aba-bad5a06db536','2018-10-30 09:50:53',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('2f4a302f-7124-49f1-8c7e-54dc326906e0','2018-10-31 08:13:19',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('2fc14f68-ccd8-434a-bab4-ef41cfb0dbaa','2018-10-27 19:02:18',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('3130be54-d401-43e4-b9f5-57fd4710e521','2018-10-30 10:21:17',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('393a279a-8342-4aef-8a9d-e67ca979575a','2018-10-28 11:29:11',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('3c5e349f-d2d9-4c0a-ac6c-28b4ad6602a7','2018-10-28 16:04:35',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('418568bd-cf56-4399-83e9-459aa191a0fe','2018-10-30 09:50:53',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('43bed39b-7114-42cd-89dd-fac09e5b507e','2018-10-30 09:50:53',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('49f310b3-8c58-42d8-9b4f-dad17fdfb05a','2018-10-30 10:21:17',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('514aaf7b-ea4b-4479-8bb3-f8077a6458f0','2018-10-29 11:07:09',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('52a8c302-fc99-4797-b392-aa8315a9bade','2018-12-17 13:31:21',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('52ee8d28-0193-479d-bf22-b54f146c370f','2018-10-31 08:17:01',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('543b062f-b8ac-4cfa-81c5-7c8df900f2da','2018-10-28 15:39:31',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('587cb0ac-cbaf-4ad0-ae74-a8c1ad4d1e9e','2018-10-30 09:50:53',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('59309c6a-7e06-4289-ac9e-1679eff291b6','2018-10-28 15:39:31',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('598fb11d-25ff-485e-b34f-abe985d60030','2018-10-29 09:42:30',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('5a51a880-4936-4659-bbe1-dc5c3fc3a0de','2018-10-27 19:59:29',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('5a800759-178d-4b23-9aab-e8dd7089e5ea','2018-10-28 15:06:15',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('5b936b16-a88e-4e41-ba38-8a2c0af183aa','2018-10-27 19:59:29',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('5d6f456a-857a-48f5-9c89-28c4ba8bada0','2018-10-28 15:39:31',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('5dfc84ad-7248-4597-8efa-4bfa28d915d6','2018-10-27 20:01:28',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('63c624e2-f0f8-4591-95fa-d8fb3902b319','2018-10-29 09:42:30',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('6dde8713-fe96-4a94-9038-427a86dcbf77','2018-10-27 19:34:34',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('6ef8c045-0748-4138-bc3c-ac31fd00b6f5','2018-10-27 19:59:29',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('6f3cd7bf-0d1d-44a0-a7fe-8eccba370dce','2018-10-27 19:28:26',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('719cc06d-540b-4dba-b30e-cfe0b99aa221','2018-10-28 15:10:40',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('72195e0f-b02d-45b3-8a24-5d7db9895640','2018-10-27 19:28:26',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('76e69137-8e0b-4bca-8438-37c91480c42f','2018-10-28 13:47:57',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('790ee3e8-ccfa-4267-8dc6-d14eb9dc9345','2018-10-28 11:29:11',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('7ec4f0c4-12e0-4e31-a948-a98e2f264067','2018-10-27 19:34:35',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('8899e9ad-74c4-4d67-8780-36e48f3e360f','2018-10-30 10:21:17',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('88d46dbd-cf1a-4d22-9e60-9aebb9f4b7f6','2018-12-17 13:33:08',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('8b26c8db-35e3-4025-af4b-bcbc31166f8f','2018-10-27 19:34:35',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('9576553a-151d-406d-a60b-e1dc7fd970d7','2018-10-28 15:39:31',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('98453859-bc14-42e8-98e5-7432babf298c','2018-10-28 15:43:23',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('9c125a5b-8135-44e0-a103-1adaf36af05f','2018-10-28 11:29:11',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('9dc3a734-71a5-4284-a7a6-e89d61724fc0','2018-10-31 08:17:01',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('9f3bb25d-a5c0-4bff-aa5d-65c7584e9f8a','2018-10-27 19:14:20',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('a2b5132d-5ead-4c98-970d-c63bf4ae2d09','2018-10-27 19:59:29',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('a4ab1966-4c3c-4f29-a414-ad5786f9459d','2018-10-27 19:14:20',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('a5c74f98-fe12-4030-8561-6c93559dcd62','2018-10-29 09:22:48',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('ac30c355-b0fd-4909-b3f1-e8195c557fdb','2018-10-31 08:13:19',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('ad79cce8-5d97-4506-b795-e5a60a69c484','2018-10-28 15:10:41',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('ada4818e-1398-4246-b26a-2de7a7534d8b','2018-10-28 13:47:57',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('af7a3b7e-80fe-4ba4-a24b-fd02ca00cdea','2018-12-17 13:31:22',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('b3480ab3-d489-499d-adce-6f88da55f380','2018-10-27 20:01:28',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('b6f2b9dd-e802-4caf-9671-1f91383f893f','2018-10-27 19:28:26',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('bc82b43a-4479-4e1a-b97b-f5eb72f16c20','2018-10-28 15:43:23',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('bfa5aa69-22cb-45b8-94a8-42c2777fbd31','2018-10-31 08:13:19',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('c1a5d7f5-baa2-4700-a444-125ac45178cf','2018-10-29 09:22:48',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('c2dec0b1-b607-4e4d-bcb6-57119695b2c8','2018-10-29 11:07:09',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('c2f53d64-7cdb-4a7f-83e4-6369d9993d9b','2018-10-27 19:34:35',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('c36dcfac-4745-4c38-9555-0be8284a611a','2018-10-28 16:04:34',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('c3f8da61-124c-4739-a2f7-310d1282bdd7','2018-10-31 08:13:19',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('c72d6ddc-707f-4ffe-8f2a-18a59249d467','2018-10-31 08:17:01',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('ca0f7675-c2dc-41be-b88a-f990e4f7a44a','2018-10-29 11:07:09',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('cb3de35d-65cd-48d4-8a8f-9e7a6509b66d','2018-10-28 15:46:22',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('cd513c49-947a-47e1-a262-dfd4093a85c3','2018-10-29 09:42:30',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('d703706c-1d14-4d0a-989f-913a480d56dc','2018-12-17 13:33:13',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('d7fd9e7d-c46a-4728-82f8-d735c01f89be','2018-10-28 15:06:15',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('dfdfe945-e866-4a4f-a8b5-a801dca85430','2018-10-27 19:28:26',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('e07b55d3-e557-40bb-b555-eff5cc899be4','2018-10-29 09:22:48',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('e1cd2643-e4c1-4962-8eed-3bbdca111564','2018-10-27 19:14:20',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('e242e180-4c2e-4838-ad46-fa5fd8f38f6a','2018-10-28 13:47:57',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('e3528453-0090-482d-90d5-bcf875d2e2a1','2018-10-28 16:04:35',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('e36d8b9f-a8ba-47e2-9ad2-1e5f43adc9ea','2018-10-28 15:46:22',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('e4dd59df-16e9-4a68-a416-d783bfe61e29','2018-10-27 20:01:28',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('e8e50c3c-20d8-42a4-a6c4-4e52de316a11','2018-10-28 15:43:23',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('eb50ef85-608d-401d-ad1e-0283a8b322cd','2018-10-29 09:22:48',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('f2a7b7f2-fd68-4f16-b677-66c3b9e5bc5b','2018-10-27 19:02:18',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('f2b64007-9245-44cd-a8d3-5a2b1a28d5cf','2018-10-28 15:06:15',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('f3817082-e296-4de7-8eb7-ece139130ecc','2018-10-27 19:02:18',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('f8a5ca69-936d-4d1d-bd81-94c644f82ea9','2018-10-31 08:17:01',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('f9f4f3a2-80ef-4d02-b0bd-f8f0a7462b8d','2018-10-28 15:46:22',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('faf5fbea-bbab-4b18-b197-3f73b3c249f4','2018-10-27 20:01:28',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6'),('fe5e6573-ac0c-4e0f-b38d-6ca8223f43cb','2018-10-28 16:04:35',1,NULL,'pep_proxy_c33f29bc-7fd1-47fc-914a-7eb2aacd43c6');
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
INSERT INTO `authzforce` VALUES ('vuBNANoREeiDKwJCrBoAAg','97c490a2-0d91-430e-af05-588825ddef66',9,'23c1fab4-2f69-470d-8778-4614522d29d3');
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
INSERT INTO `oauth_access_token` VALUES ('026d07fd7ecc9665e2a894171d539d1ae8c2cc90','2018-11-23 08:56:53',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','7b43faa9-12f7-46a7-a28e-9f1c4a2633b9',NULL),('054325c3f87bfe37a35cbee025d8be7013c774aa','2018-10-29 16:55:27',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('0cf4679e18d5e592694ee493eab938e0254489af','2018-10-30 09:30:19',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('1ef5f16168dd63591ea75f1eb1d03b3adb8c9785','2018-10-29 10:56:50',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('1f2916ff15ad416301dda83ab27faee00b324a16','2018-10-31 08:38:18',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','7b43faa9-12f7-46a7-a28e-9f1c4a2633b9',NULL),('34a9aa4b4b60f491b808a5b22f284686259e386f','2018-10-29 16:47:50',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('46c89f9a41fd14f258c9fe261cd64127ea06c796','2018-12-17 13:47:16',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','7b43faa9-12f7-46a7-a28e-9f1c4a2633b9',NULL),('51a4bb190a213fe15c475a2d798f0f84b18414bf','2018-10-29 10:30:18',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('57f8311692f5332972461f2655973a0f3f93343c','2018-10-29 11:15:21',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('5840de79746e8cbec400fbaa631d78caf0e6d6e0','2018-10-30 18:24:47',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('59684afde188c671d143880e8a80822a6b4a2ad1','2018-10-30 08:04:54',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('5f639441e48775a82829907a2dc355e8bc9c940c','2018-10-29 16:54:19',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('605ed83e6ae8a48dbbe4d89dba55974b0ef3edb4','2018-10-29 14:23:00',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('60da4d2624a65bfa06afb9cbe65b70cf5f460aca','2018-10-29 14:23:00',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('76a2898307ff90bc67529ab152001de6b1dc1661','2018-10-27 21:15:49',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('9386129b8cc02eb16823d496bfdc1fea68088683','2018-10-30 10:30:11',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('9704ad59b7abe1b29bc6c559811ed52fe9ce40b9','2018-10-29 11:16:01',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('9e5bd7e39e44ead5184fb7275d4860fdd4e1161d','2018-10-30 09:28:15',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('a0caa402219f05048376a15e423b06878ebbe7fb','2018-10-29 12:20:05',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('a734f9cffde396bc78699b14c4057e873898fd03','2018-10-31 08:13:36',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('ae311553b7e8d82ec25dc6ffb2bf76de02ac48c1','2018-10-29 17:00:57',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('b88c79a36ae49b7abe6b1ab8c9a8eefb9e7e124e','2018-10-29 16:59:19',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('c37b603def19af679b4637b8602d061da71c8ac4','2018-10-29 19:09:14',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('c636fd060968b1c95742964c47d1938b94a6f2c2','2018-10-29 12:20:05',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('c6dece281cfa67905a5b78c116aa627781e1c55d','2018-10-29 16:42:18',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('cf43fee44e6056cde01045850a2a1bdaf41255d5','2018-10-30 10:15:14',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('e10e288194a373fc2c95a2f707bbeabc4ce66eb5','2018-10-30 08:04:54',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('ef8323c30698c8c3ffe46383c17867c3eba2ed45','2018-10-28 13:40:54',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','7b43faa9-12f7-46a7-a28e-9f1c4a2633b9',NULL),('f8596e6108177148558e71a863af1098769bda50','2018-10-31 08:13:36',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('fbb9369ea26f5b9d4c2321312897301e047b3794','2018-10-30 18:24:47',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('fd077b868b21e12b1e6c1f287dd15acd99a813d3','2018-10-27 19:48:01',NULL,NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL);
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
INSERT INTO `oauth_authorization_code` VALUES ('39aadf37b0b2a46b59a4bd3311a96198bf423310','2018-11-23 08:01:53','http://192.168.99.100:30080/complete/fiware/',NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','7b43faa9-12f7-46a7-a28e-9f1c4a2633b9'),('3b1ebe886a4f56f401d10301abda2d7b26b06cb7','2018-10-29 09:35:18','http://localhost/complete/fiware/',NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho'),('7c0710edf76f733026140b17594e3190c06aa20d','2018-10-30 08:35:19','http://localhost/complete/fiware/',NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho'),('9accfa9de177beebf73d4bda63f1bee23a68dc25','2018-12-17 12:52:16','http://192.168.99.100:30080/complete/fiware/',NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','7b43faa9-12f7-46a7-a28e-9f1c4a2633b9'),('dce6f7b00d4867997d4b56a203ab225627595e3b','2018-10-31 07:43:17','http://localhost/complete/fiware/',NULL,NULL,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','7b43faa9-12f7-46a7-a28e-9f1c4a2633b9');
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
INSERT INTO `oauth_client` VALUES ('23c1fab4-2f69-470d-8778-4614522d29d3','WireCloud','WireCloud','0b9194f0-f74a-4717-9222-170e9e473bf4','http://localhost','http://192.168.99.100:30080/complete/fiware/','default','authorization_code,implicit,password,client_credentials,refresh_token','code,token',NULL,NULL,NULL,'bearer',NULL),('idm_admin_app','idm','idm',NULL,'','','default','','',NULL,NULL,NULL,'bearer',NULL);
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
INSERT INTO `oauth_refresh_token` VALUES ('1bbb76a22c056cf067a5cf69e2f4eb97a6cbce2f','2018-12-07 07:56:53',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','7b43faa9-12f7-46a7-a28e-9f1c4a2633b9',NULL),('1bed0693426afd654430f5456d4697244061925a','2018-11-12 16:00:57',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('1e6c4bc7117b3255a2f78ffd94134ebb162f1e2b','2018-11-12 11:20:05',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('1ef38ad4f09b901318dbd30ae43092b18a3296ef','2018-11-10 21:15:49',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('3c67d3dff49239ab2e64e73f283a523915755957','2018-11-12 15:47:50',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('49c4e6738d02211e69cfdc48c9a3b37c819466bc','2018-11-11 12:40:54',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','7b43faa9-12f7-46a7-a28e-9f1c4a2633b9',NULL),('4d08feb7abae2f4ac61857bafd72929341e6f33e','2018-11-12 15:54:19',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('5aa3ea0dd1d78f47229e28124358b1181147a7d2','2018-11-12 13:23:00',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('6786cb7e01223d52ab23607549e9c419167387bc','2018-11-12 15:55:27',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('6bcd5de63a734f95682e1761d4d8948afd947b8d','2018-11-14 07:38:18',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','7b43faa9-12f7-46a7-a28e-9f1c4a2633b9',NULL),('7795573fb74347ea1bc0fa3e174f29b9731fd77d','2018-11-12 09:56:50',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('7d1607e94e809dd0eca2656acf7a35ea83dbd1f4','2018-12-31 12:47:16',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','7b43faa9-12f7-46a7-a28e-9f1c4a2633b9',NULL),('86271273984692d9b1ce509e911d4299d33be1ad','2018-11-13 07:04:54',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('870ad4cbea96103edeca41d2afd70cc4886e08f6','2018-11-10 19:48:01',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('8740aca512fe7b265628fbf4285e72a94d9f2fd3','2018-11-13 17:24:47',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('8bcf6176dc03578b3b1b6c4e8f67cef13b38c3de','2018-11-12 10:16:01',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('93305a643fa6c550d7e151587239eba427620d11','2018-11-12 10:15:21',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('b0f27af19e01ed97ac09bbf692fc25109c40ed65','2018-11-14 07:13:36',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('c2c8972cffd64df1839b82a9ad93361f1fc4e09f','2018-11-13 08:28:15',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('d49cb6bf2412620b2f3d862616a7d719e8cb3885','2018-11-14 07:13:36',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('de28aa4a208a9439a5a82c3141dbc03eed200026','2018-11-12 15:59:19',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL),('ff6f6e21ee36756683e9610ccfef0b9b47591d3d','2018-11-13 09:15:14',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','salho',NULL);
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
INSERT INTO `permission` VALUES ('07371495-fd92-4f52-b725-2d7df15a2929','Add Devices','Add Devices',0,'POST','/iot/devices','','23c1fab4-2f69-470d-8778-4614522d29d3'),('1','Get and assign all internal application roles',NULL,1,NULL,NULL,NULL,'idm_admin_app'),('2','Manage the application',NULL,1,NULL,NULL,NULL,'idm_admin_app'),('285eabd5-e983-4b45-a34d-94b527174ce6','Delete Devices','Delete Devices',0,'DELETE','/iot/devices','','23c1fab4-2f69-470d-8778-4614522d29d3'),('2ff17660-0a45-46e9-8cf7-5b3975cf79ec','Edit Subscriptions','Edit Subscriptions',0,'PUT','/v2/subscriptions','','23c1fab4-2f69-470d-8778-4614522d29d3'),('3','Manage roles',NULL,1,NULL,NULL,NULL,'idm_admin_app'),('316f6e3d-ca4a-40ea-9029-7918f00c3c62','Create Entities','Create Entities',0,'POST','/v2/entities','','23c1fab4-2f69-470d-8778-4614522d29d3'),('337714cf-063c-4823-84c2-7161b22b6a14','Edit Entities','Edit Entities',0,'PUT','/v2/entities','','23c1fab4-2f69-470d-8778-4614522d29d3'),('372cd3ff-495d-4423-8303-881eda7bca8d','Edit Devices','Edit Devices',0,'PUT','/iot/devices','','23c1fab4-2f69-470d-8778-4614522d29d3'),('4','Manage authorizations',NULL,1,NULL,NULL,NULL,'idm_admin_app'),('4871342d-b110-4003-9599-1b4bd0eec9e6','Add Services','Add Services',0,'POST','/iot/services','','23c1fab4-2f69-470d-8778-4614522d29d3'),('5','Get and assign all public application roles',NULL,1,NULL,NULL,NULL,'idm_admin_app'),('59a928ee-75b3-411c-99f3-7efc79f966e3','Subscribe Context','Subscribe Context',0,'POST','/v1/subscribeContext','','23c1fab4-2f69-470d-8778-4614522d29d3'),('5e71678d-4e4c-4231-8225-2671a0312016','Edit Services','Edit Services',0,'PUT','/iot/services','','23c1fab4-2f69-470d-8778-4614522d29d3'),('6','Get and assign only public owned roles',NULL,1,NULL,NULL,NULL,'idm_admin_app'),('63dd042e-3782-469a-920a-a46589fc1679','Unsubscribe Context','Unsubscribe Context',0,'POST','/v1/unsubscribeContext','','23c1fab4-2f69-470d-8778-4614522d29d3'),('748aefe2-03ca-43ab-92ca-dff3cf8607eb','Update V1 ContextSubscription','Update V1 ContextSubscription',0,'POST','v1/updateContextSubscription',NULL,'23c1fab4-2f69-470d-8778-4614522d29d3'),('871babd8-3789-4661-8fde-b4871b0010f3','Query Context Entities','Query Context Entities',0,'GET','/STH/v1/contextEntities','','23c1fab4-2f69-470d-8778-4614522d29d3'),('9f50e2dc-dcfa-4548-bee2-7282d17c9011','Delete Services','Delete Services',0,'DELETE','/iot/services','','23c1fab4-2f69-470d-8778-4614522d29d3'),('a00e6338-dfeb-4461-974c-e857ed300f1b','Get Entities','Get Entities',0,'GET','/v2/entities','','23c1fab4-2f69-470d-8778-4614522d29d3'),('a5c33ca9-4071-4f73-aa36-7e78217e74a9','Get Devices','Get Devices',0,'GET','/iot/devices','','23c1fab4-2f69-470d-8778-4614522d29d3'),('bce86f20-04d7-4ca6-80c8-27f808655896','Get Services','Get Services',0,'GET','/iot/services','','23c1fab4-2f69-470d-8778-4614522d29d3'),('c7f7aa7a-0b00-40b0-bcb5-66239fc63f5b','Delete Subscriptions','Delete Subscriptions',0,'DELETE','/v2/subscriptions','','23c1fab4-2f69-470d-8778-4614522d29d3'),('d700394d-e7a6-4e44-a72b-a958b8982554','Get Subscriptions','Get Subscriptions',0,'GET','/v2/subscriptions','','23c1fab4-2f69-470d-8778-4614522d29d3'),('d8457cea-eae9-45be-966e-e1fe94deafd5','Delete Entities','Delete Entities',0,'DELETE','/v2/entities','','23c1fab4-2f69-470d-8778-4614522d29d3'),('e4c4c0a4-f7dd-42b8-bc45-06ccdfad4327','Query Context','Query Context',0,'POST','/v1/queryContext','','23c1fab4-2f69-470d-8778-4614522d29d3'),('e570d9b2-5773-4251-9b93-b7a16ee49971','Add Subscriptions','Add Subscriptions',0,'POST','/v2/subscriptions','','23c1fab4-2f69-470d-8778-4614522d29d3'),('f0093a10-bac0-45af-973c-d6f5f2191830','Patch Entities','Patch Entites',0,'PATCH','/v2/entities','','23c1fab4-2f69-470d-8778-4614522d29d3');
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
INSERT INTO `role` VALUES ('325b5a8d-7a19-47f6-8d8e-4c49db7fb037','Device Manager',0,'23c1fab4-2f69-470d-8778-4614522d29d3'),('446b0cae-0eea-418b-943c-34b3456a817d','STH Manager',0,'23c1fab4-2f69-470d-8778-4614522d29d3'),('b61ec9a9-9703-4eb3-ac86-3d334e2286a1','Data Manager',0,'23c1fab4-2f69-470d-8778-4614522d29d3'),('provider','Provider',1,'idm_admin_app'),('purchaser','Purchaser',1,'idm_admin_app');
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_assignment`
--

LOCK TABLES `role_assignment` WRITE;
/*!40000 ALTER TABLE `role_assignment` DISABLE KEYS */;
INSERT INTO `role_assignment` VALUES (14,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','b61ec9a9-9703-4eb3-ac86-3d334e2286a1',NULL,'7b43faa9-12f7-46a7-a28e-9f1c4a2633b9'),(15,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','provider',NULL,'salho'),(16,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','b61ec9a9-9703-4eb3-ac86-3d334e2286a1',NULL,'salho'),(17,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','446b0cae-0eea-418b-943c-34b3456a817d',NULL,'salho'),(18,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','325b5a8d-7a19-47f6-8d8e-4c49db7fb037',NULL,'salho'),(19,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','provider',NULL,'7b43faa9-12f7-46a7-a28e-9f1c4a2633b9'),(20,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','446b0cae-0eea-418b-943c-34b3456a817d',NULL,'7b43faa9-12f7-46a7-a28e-9f1c4a2633b9'),(21,NULL,'23c1fab4-2f69-470d-8778-4614522d29d3','325b5a8d-7a19-47f6-8d8e-4c49db7fb037',NULL,'7b43faa9-12f7-46a7-a28e-9f1c4a2633b9');
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
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission`
--

LOCK TABLES `role_permission` WRITE;
/*!40000 ALTER TABLE `role_permission` DISABLE KEYS */;
INSERT INTO `role_permission` VALUES (1,'provider','1'),(2,'provider','2'),(3,'provider','3'),(4,'provider','4'),(5,'provider','5'),(6,'provider','6'),(7,'purchaser','5'),(146,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','316f6e3d-ca4a-40ea-9029-7918f00c3c62'),(147,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','d8457cea-eae9-45be-966e-e1fe94deafd5'),(148,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','a00e6338-dfeb-4461-974c-e857ed300f1b'),(149,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','337714cf-063c-4823-84c2-7161b22b6a14'),(150,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','e570d9b2-5773-4251-9b93-b7a16ee49971'),(151,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','c7f7aa7a-0b00-40b0-bcb5-66239fc63f5b'),(152,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','2ff17660-0a45-46e9-8cf7-5b3975cf79ec'),(153,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','d700394d-e7a6-4e44-a72b-a958b8982554'),(154,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','285eabd5-e983-4b45-a34d-94b527174ce6'),(155,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','f0093a10-bac0-45af-973c-d6f5f2191830'),(156,'b61ec9a9-9703-4eb3-ac86-3d334e2286a1','748aefe2-03ca-43ab-92ca-dff3cf8607eb'),(157,'325b5a8d-7a19-47f6-8d8e-4c49db7fb037','07371495-fd92-4f52-b725-2d7df15a2929'),(158,'325b5a8d-7a19-47f6-8d8e-4c49db7fb037','4871342d-b110-4003-9599-1b4bd0eec9e6'),(159,'325b5a8d-7a19-47f6-8d8e-4c49db7fb037','285eabd5-e983-4b45-a34d-94b527174ce6'),(160,'325b5a8d-7a19-47f6-8d8e-4c49db7fb037','9f50e2dc-dcfa-4548-bee2-7282d17c9011'),(161,'325b5a8d-7a19-47f6-8d8e-4c49db7fb037','372cd3ff-495d-4423-8303-881eda7bca8d'),(162,'325b5a8d-7a19-47f6-8d8e-4c49db7fb037','5e71678d-4e4c-4231-8225-2671a0312016'),(163,'325b5a8d-7a19-47f6-8d8e-4c49db7fb037','a5c33ca9-4071-4f73-aa36-7e78217e74a9'),(164,'325b5a8d-7a19-47f6-8d8e-4c49db7fb037','bce86f20-04d7-4ca6-80c8-27f808655896'),(165,'446b0cae-0eea-418b-943c-34b3456a817d','871babd8-3789-4661-8fde-b4871b0010f3'),(166,'446b0cae-0eea-418b-943c-34b3456a817d','e4c4c0a4-f7dd-42b8-bc45-06ccdfad4327'),(167,'446b0cae-0eea-418b-943c-34b3456a817d','59a928ee-75b3-411c-99f3-7efc79f966e3'),(168,'446b0cae-0eea-418b-943c-34b3456a817d','63dd042e-3782-469a-920a-a46589fc1679');
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
INSERT INTO `user` VALUES ('7b43faa9-12f7-46a7-a28e-9f1c4a2633b9','johnny',NULL,NULL,'default',0,'jd@test.com','bcfa63aa5b5ebab68c7c4a520a29821e8162452c','2018-10-28 12:26:41',1,0,NULL,NULL,1,NULL,'362e08b6c216e34d'),('admin','admin',NULL,NULL,'default',0,'admin@test.com','02ed617302f0656fc8cd02b6556cb6f612cea10f','2018-10-27 17:40:55',1,1,NULL,NULL,0,NULL,'b83eaa64f7ddf7ce'),('salho','salho',NULL,NULL,'default',0,'peter.salhofer@fh-joanneum.at','577dae600f801e8fd8136221abe238d972acd873','2018-10-27 17:54:13',1,0,NULL,NULL,1,NULL,'d3a5269999f64214');
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

-- Dump completed on 2018-12-17 13:01:45
