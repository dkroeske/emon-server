DROP TABLE IF EXISTS `meter`;

CREATE TABLE `meter` (
  `id` INTEGER PRIMARY KEY,
  `created` NUMERIC NOT NULL,
  `updated` NUMERIC NOT NULL,
  `location` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `ipu` INTEGER DEFAULT 0
);

INSERT INTO `meter` VALUES (21, datetime('now'), datetime('now'), '4813CT, 1','Main E-meter', 0);
INSERT INTO `meter` VALUES (24, datetime('now'), datetime('now'), '4813CT, 1','PV cells E-meter', 0);
INSERT INTO `meter` VALUES (27, datetime('now'), datetime('now'), '4813CT, 1','Car charger E-meter', 0);

DROP TABLE IF EXISTS `measurement`;

CREATE TABLE `measurement` (
  `id` INTEGER PRIMARY KEY,
  `epoch` NUMERIC NOT NULL,
  `m_id` INTEGER NOT NULL,
  FOREIGN KEY (`m_id`) REFERENCES `meter`(`id`) ON UPDATE CASCADE
);

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` INTEGER PRIMARY KEY,
  `username` TEXT NOT NULL,
  `password` TEXT NOT NULL,
  `role` TEXT NOT NULL
);

INSERT INTO `user` VALUES (1, 'testuser', 'testpassword', 'user');
INSERT INTO `user` VALUES (2, 'dkroeske@gmail.com', 'secret', 'admin');
