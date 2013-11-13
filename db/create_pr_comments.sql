CREATE TABLE `pr_comments` (
  `created_at` datetime DEFAULT NULL,
  `user_id` varchar(64) DEFAULT NULL,
  `user_login` varchar(64) DEFAULT NULL,
  `body` longtext,
  `number` int(11) DEFAULT NULL,
  `pr_id` int(11) unsigned NOT NULL,
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `pr_id_fk` (`pr_id`),
  CONSTRAINT `pr_id_fk` FOREIGN KEY (`pr_id`) REFERENCES `pull_requests` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8004 DEFAULT CHARSET=utf8;
