-- ---
-- Globals
-- ---

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'reviews'
--
-- ---

DROP TABLE IF EXISTS reviews;

CREATE TABLE reviews (
  id INTEGER,
  product_id INTEGER,
  rating INT NOT NULL DEFAULT 3,
  date bigint,
  summary TEXT,
  body TEXT,
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name VARCHAR(50),
  email text,
  response TEXT,
  helpfulness smallint
);

copy reviews from '/Users/derek/Documents/Hack Reactor/Work/SDC/ratings-and-reviews/data/reviews.csv' with delimiter ',';


-- ---
-- Table 'products'
--
-- ---

DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id INTEGER,
  name VARCHAR(50),
  slogan text,
  description text,
  category varchar(20),
  default_price integer
);

copy products (id, name, slogan, description, category, default_price) from '/Users/derek/Documents/Hack Reactor/Work/SDC/ratings-and-reviews/data/product.csv' with delimiter ',';

-- ---
-- Table 'characteristics'
--
-- ---

-- DROP TABLE IF EXISTS characteristics;

-- CREATE TABLE characteristics (
--   id integer,
--   product_id integer,
--   name VARCHAR(9)
-- );

-- ---
-- Table 'characteristic-reviews'
--
-- ---

-- DROP TABLE IF EXISTS characteristic-reviews;

-- CREATE TABLE characteristic_reviews (
--   id integer,
--   characteristic_id integer,
--   review_id integer,
--   value integer
-- );

-- ---
-- Table 'review-photos'
--
-- ---

-- DROP TABLE IF EXISTS reviews-photos;

-- CREATE TABLE reviews_photos (
--   id INTEGER,
--   review_id INTEGER,
--   url text
-- );

-- copy reviews_photos from '/Users/derek/Documents/Hack Reactor/Work/SDC/ratings-and-reviews/data/reviews_photos.csv' with delimiter ',';

-- ---
-- Foreign Keys
-- ---

ALTER TABLE `reviews` ADD FOREIGN KEY (id) REFERENCES `review-characteristics` (`review_id`);
ALTER TABLE `reviews` ADD FOREIGN KEY (id) REFERENCES `review-photos` (`review_id`);

-- ---
-- Table Properties
-- ---

ALTER TABLE `reviews` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `review-characteristics` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `review-photos` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

-- INSERT INTO `reviews` (`id`,`product_id`,`rating`,`summary`,`recommend`,`response`,`body`,`date`,`reviewer_name`,`email`,`helpfulness`,`photos`,`reported`) VALUES
-- ('','','','','','','','','','','','','');
-- INSERT INTO `review-characteristics` (`id`,`characteristic`,`score`,`review_id`) VALUES
-- ('','','','');
-- INSERT INTO `review-photos` (`id`,`url`,`review_id`) VALUES
-- ('','','');