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

copy products (id, name, slogan, description, category, default_price) from '/Users/derek/Documents/Hack Reactor/Work/SDC/ratings-and-reviews/data/product.csv' csv header quote '"';

-- ---
-- Table 'characteristics'
--
-- ---

-- DROP TABLE IF EXISTS characteristics;

CREATE TABLE characteristics (
  id integer,
  product_id integer,
  name VARCHAR(9)
);

copy characteristics (id, product_id, name) from '/Users/derek/Documents/Hack Reactor/Work/SDC/ratings-and-reviews/data/characteristics.csv' with delimiter ',';

-- ---
-- Table 'characteristic-reviews'
--
-- ---

-- DROP TABLE IF EXISTS characteristic-reviews;

CREATE TABLE characteristic_reviews (
  id integer,
  characteristic_id integer,
  review_id integer,
  value integer
);

copy characteristic_reviews from '/Users/derek/Documents/Hack Reactor/Work/SDC/ratings-and-reviews/data/characteristic_reviews.csv' with delimiter ',';


-- ---
-- Table 'review-photos'
--
-- ---

-- DROP TABLE IF EXISTS reviews-photos;

CREATE TABLE reviews_photos (
  id INTEGER,
  review_id INTEGER,
  url text
);

copy reviews_photos from '/Users/derek/Documents/Hack Reactor/Work/SDC/ratings-and-reviews/data/reviews_photos.csv' with delimiter ',';

-- ---
-- Primary Keys
-- ---

ALTER TABLE reviews ADD PRIMARY KEY (id);
ALTER TABLE products ADD PRIMARY KEY (id);
ALTER TABLE characteristics ADD PRIMARY KEY (id);
ALTER TABLE reviews_photos ADD PRIMARY KEY (id);
ALTER TABLE characteristic_reviews ADD PRIMARY KEY (id);


-- ---
-- Foreign Keys
-- ---

ALTER TABLE reviews ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products (id);
ALTER TABLE characteristics ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products (id);
ALTER TABLE characteristic_reviews ADD CONSTRAINT fk_characteristic FOREIGN KEY (characteristic_id) REFERENCES characteristics (id);
ALTER TABLE characteristic_reviews ADD CONSTRAINT fk_review FOREIGN KEY (review_id) REFERENCES reviews (id);
ALTER TABLE reviews_photos ADD CONSTRAINT fk_review FOREIGN KEY (review_id) REFERENCES reviews (id);


-- ---
-- Table Properties
-- ---

ALTER TABLE reviews SET LOGGED;
ALTER TABLE products SET LOGGED;
ALTER TABLE characteristics SET LOGGED;
ALTER TABLE characteristic_reviews SET LOGGED;
ALTER TABLE review_photos SET LOGGED;


-- missing line 1 somehow

INSERT INTO products values (1, 'Camo Onesie', 'Blend in to your crowd', 'The So Fatigues will wake you up and fit you in. This high energy camo will have you blending in to even the wildest surroundings.', 'Jackets', 140);
