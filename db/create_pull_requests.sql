CREATE TABLE `pull_requests` (
  `repo_id` int(11) DEFAULT NULL,
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `number` int(11) DEFAULT NULL,
  `repo_owner` varchar(64) DEFAULT NULL,
  `repo_name` varchar(64) DEFAULT NULL,
  `submitted_by_id` varchar(64) DEFAULT NULL,
  `submitted_by_name` varchar(64) DEFAULT NULL,
  `merged_at` datetime DEFAULT NULL,
  `submitted_on` datetime DEFAULT NULL,
  `body` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6260 DEFAULT CHARSET=utf8;
