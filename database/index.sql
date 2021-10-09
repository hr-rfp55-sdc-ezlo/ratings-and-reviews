-- ---
-- Globals
-- ---

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'reviews'
--
-- ---

DROP TABLE IF EXISTS reviews CASCADE;

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

ALTER TABLE reviews SET UNLOGGED;

copy reviews from '/Users/derek/Documents/Hack Reactor/Work/SDC/ratings-and-reviews/data/reviews.csv' csv header quote '"';

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

ALTER TABLE products SET UNLOGGED;

copy products (id, name, slogan, description, category, default_price) from '/Users/derek/Documents/Hack Reactor/Work/SDC/ratings-and-reviews/data/product.csv' csv header quote '"';

-- ---
-- Table 'characteristics'
--
-- ---

DROP TABLE IF EXISTS characteristics CASCADE;

CREATE TABLE characteristics (
  id integer,
  product_id integer,
  name VARCHAR(9)
);

ALTER TABLE characteristics SET UNLOGGED;

copy characteristics (id, product_id, name) from '/Users/derek/Documents/Hack Reactor/Work/SDC/ratings-and-reviews/data/characteristics.csv' csv header quote '"';

-- ---
-- Table 'characteristic-reviews'
--
-- ---

DROP TABLE IF EXISTS characteristic_reviews;

CREATE TABLE characteristic_reviews (
  id integer,
  characteristic_id integer,
  review_id integer,
  value integer
);

ALTER TABLE characteristic_reviews SET UNLOGGED;

copy characteristic_reviews from '/Users/derek/Documents/Hack Reactor/Work/SDC/ratings-and-reviews/data/characteristic_reviews.csv' csv header quote '"';


-- ---
-- Table 'review-photos'
--
-- ---

DROP TABLE IF EXISTS reviews_photos;

CREATE TABLE reviews_photos (
  id INTEGER,
  review_id INTEGER,
  url text
);

ALTER TABLE reviews_photos SET UNLOGGED;

copy reviews_photos from '/Users/derek/Documents/Hack Reactor/Work/SDC/ratings-and-reviews/data/reviews_photos.csv' csv header quote '"';

-- ---
-- Table Properties
-- ---

ALTER TABLE reviews SET LOGGED;
ALTER TABLE products SET LOGGED;
ALTER TABLE characteristics SET LOGGED;
ALTER TABLE characteristic_reviews SET LOGGED;
ALTER TABLE reviews_photos SET LOGGED;

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

-- Indexes

CREATE INDEX idx_reviews_prod ON reviews (product_id);
CREATE INDEX idx_characteristics_prod ON characteristics (product_id);
CREATE INDEX idx_charrev_rev ON characteristic_reviews (review_id);
CREATE INDEX idx_charrev_char ON characteristic_reviews (characteristic_id);
CREATE INDEX idx_photos_rev ON reviews_photos (review_id);


-- missing line 1 somehow

INSERT INTO products values (1, 'Camo Onesie', 'Blend in to your crowd', 'The So Fatigues will wake you up and fit you in. This high energy camo will have you blending in to even the wildest surroundings.', 'Jackets', 140);

/*
SELECT
    pg_size_pretty (
        pg_database_size ('reviews')
    );
*/