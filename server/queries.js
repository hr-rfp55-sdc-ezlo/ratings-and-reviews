const { Pool, Client } = require('pg')
// pools will use environment variables
// for connection information
const pool = new Pool({
  user: 'derek',
  password: '',
  host: 'localhost',
  database: 'reviews',
  port: 5432,
})

// const text; // text for queries with $1, $2, etc. in VALUES
// const values; // array of values to replace $ stand-ins
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('Error connecting to db: ', err);
  } else {
    console.log('Connected to db!')
  }
})

const getReviews = (params, callback) => {
  var query = `SELECT
    r.product_id as product,
    json_agg(
      json_build_object(
        'review_id', r.id, 'rating', r.rating, 'summary', r.summary, 'recommend', r.recommend, 'response', r.response, 'body', r.body, 'date', r.date, 'reviewer_name', r.reviewer_name, 'helpfulness', r.helpfulness, 'photos', photos
      )
    ) results
  FROM reviews r
  LEFT JOIN (
    SELECT
      review_id,
      json_agg(
        json_build_object(
          'id', rp.id,
          'url', rp.url
        )
      ) photos
    FROM
      reviews_photos rp
    GROUP BY rp.review_id
  )
  rp on r.id = rp.review_id
  WHERE r.product_id = $1
  GROUP BY r.product_id
  ORDER BY $2
  LIMIT $3
  OFFSET $4`;
  var values = [params.product_id, params.sort, params.count, params.count * params.page];

  pool.query(query, values, (err, res) => {
    console.error(err);
    if (err) {
      callback(err);
    } else {
      callback(null, res.rows);
    }
  });
}

/*
SELECT r.product_id as product,
  json_agg(json_build_object('review_id', r.id, 'rating', r.rating, 'summary', r.summary, 'recommend', r.recommend, 'response', r.response, 'body', r.body, 'date', r.date, 'reviewer_name', r.reviewer_name, 'helpfulness', r.helpfulness, 'photos', json_agg(json_build_object('id', rp.id, 'url', rp.url)))) AS results FROM reviews r INNER JOIN reviews_photos rp on r.id = rp.review_id WHERE r.product_id = 1 GROUP BY r.id;

SELECT
  r.product_id as product,
  json_agg(
    json_build_object(
      'review_id', r.id, 'rating', r.rating, 'summary', r.summary, 'recommend', r.recommend, 'response', r.response, 'body', r.body, 'date', r.date, 'reviewer_name', r.reviewer_name, 'helpfulness', r.helpfulness, 'photos',
      json_build_array(
        json_build_object(
          'id', rp.id, 'url', rp.url
        )
      )
    )
  ) AS results
  FROM reviews r
  INNER JOIN reviews_photos rp on r.id = rp.review_id
  WHERE r.product_id = $1
  GROUP BY r.id
  ORDER BY $2
  LIMIT $3
  OFFSET $4

SELECT
  r.product_id as product
  json_build_object(
    'results', json_agg(
      json_build_object(
        review_id', r.id, 'rating', r.rating, 'summary', r.summary, 'recommend', r.recommend, 'response', r.response, 'body', r.body, 'date', r.date, 'reviewer_name', r.reviewer_name, 'helpfulness', r.helpfulness, 'photos', photos
      )
    )
  ) results
FROM reviews r
LEFT JOIN (
  SELECT
    review_id,
    json_agg(
      json_build_object(
        'id', rp.id,
        'url', rp.id
      )
    ) photos
  FROM
    reviews_photos rp
)
r on r.id = rp.review_id
WHERE r.product_id = 40344;

COALESCE(json_agg(json_build_object('id', id, 'url', url)) FILTER (WHERE id IS NOT NULL), '[]') photos
*/

const getMeta = (params, callback) => {
  var query = 'SELECT reviews.product_id, count(CASE reviews.rating WHEN 1 THEN 1 ELSE NULL END) as "1", count(CASE reviews.rating WHEN 2 THEN 1 ELSE NULL END) as "2", count(CASE reviews.rating WHEN 3 THEN 1 ELSE NULL END) as "3", count(CASE reviews.rating WHEN 4 THEN 1 ELSE NULL END) as "4", count(CASE reviews.rating WHEN 5 THEN 1 ELSE NULL END) as "5", count(CASE reviews.recommend WHEN false THEN 1 ELSE NULL END) as "rec0", count(CASE reviews.recommend WHEN true THEN 1 ELSE NULL END) as "rec1", characteristics.name, characteristic_reviews.characteristic_id, avg(characteristic_reviews.value) FROM reviews LEFT OUTER JOIN characteristic_reviews ON (reviews.id = characteristic_reviews.review_id) LEFT OUTER JOIN characteristics ON (characteristic_reviews.characteristic_id = characteristics.id) WHERE reviews.product_id = $1 AND characteristic_id IN (SELECT id FROM characteristics WHERE product_id = $1) GROUP BY reviews.product_id, reviews.rating, characteristic_reviews.characteristic_id, characteristics.name';
  var values = [params.product_id];

  pool.query(query, values, (err, res) => {
    if (err) {
      callback(err);
    } else {
      callback(null, res.rows);
    }
  });
}
//READ UP ON QUERIES
// BIG AGGREGATE WITH AVERAGES AND NESTED OBJECTS
// 'SELECT avg(value) FROM characteristic_reviews WHERE characteristic_id = #'
// 'SELECT characteristic_id, avg(value) FROM characteristic_reviews WHERE characteristic_id < 5;'
/**


SELECT
    characteristic_id,
    avg(value)
FROM
    characteristic_reviews
WHERE
    characteristic_id = (SELECT id FROM characteristics WHERE product_id = 40344)
GROUP BY
    characteristic_id;


SELECT reviews.product_id,
  count(CASE reviews.rating WHEN 1 THEN 1 ELSE NULL END) as "rating1",
  count(CASE reviews.rating WHEN 2 THEN 1 ELSE NULL END) as "rating2",
  count(CASE reviews.rating WHEN 3 THEN 1 ELSE NULL END) as "rating3",
  count(CASE reviews.rating WHEN 4 THEN 1 ELSE NULL END) as "rating4",
  count(CASE reviews.rating WHEN 5 THEN 1 ELSE NULL END) as "rating5",
  count(CASE reviews.recommend WHEN false THEN 1 ELSE NULL END) as "rec0",
  count(CASE reviews.recommend WHEN true THEN 1 ELSE NULL END) as "rec1",
  characteristic_reviews.characteristic_id,
  avg(characteristic_reviews.value)
FROM
  reviews, characteristic_reviews
WHERE
  product_id = 7 AND characteristic_id IN (SELECT id FROM characteristics WHERE product_id = 7)
GROUP BY product_id, characteristic_reviews.characteristic_id;

SELECT
  reviews.product_id,
  count(CASE reviews.rating WHEN 1 THEN 1 ELSE NULL END) as "1",
  count(CASE reviews.rating WHEN 2 THEN 1 ELSE NULL END) as "2",
  count(CASE reviews.rating WHEN 3 THEN 1 ELSE NULL END) as "3",
  count(CASE reviews.rating WHEN 4 THEN 1 ELSE NULL END) as "4",
  count(CASE reviews.rating WHEN 5 THEN 1 ELSE NULL END) as "5",
  count(CASE reviews.recommend WHEN false THEN 1 ELSE NULL END) as "0",
  count(CASE reviews.recommend WHEN true THEN 1 ELSE NULL END) as "1",
  characteristics.name,
  characteristic_reviews.characteristic_id,
  avg(characteristic_reviews.value)
FROM
  reviews INNER JOIN characteristic_reviews ON (reviews.id = characteristic_reviews.review_id) INNER JOIN characteristics ON (characteristic_reviews.characteristic_id = characteristics.id)
WHERE
  reviews.product_id = 4 AND characteristic_id IN (SELECT id FROM characteristics WHERE product_id = 4)
GROUP BY
  reviews.product_id, reviews.rating, characteristic_reviews.characteristic_id, characteristics.name
 */


const markHelpful = (params, callback) => {
  var query = 'UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id = $1';
  var values = [params.review_id];

  pool.query(query, values, (err, res) => {
    if (err) {
      callback(err);
    } else {
      callback(null, res.rows);
    }
  });
}

const reportReview = (params, callback) => {
  var query = 'UPDATE reviews SET reported = true WHERE id = $1';
  var values = [params.review_id];

  pool.query(query, values, (err, res) => {
    if (err) {
      callback(err);
    } else {
      callback(null, res.rows);
    }
  });
}




const postReview = (params, callback) => {
  var query = `INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reviewer_name, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
  var values = [params.product_id, params.rating, params.date, params.summary, params.body, params.recommend, params.reviewer_name, params.email]; //CHECK HOW DATA IS SENT FROM APP

  pool.query(query, values, (err, res) => {
    if (err) {
      callback(err);
    } else {
      callback(null, res.rows);
    }
  });

}

/**



 */



module.exports = {
  pool,
  getReviews,
  markHelpful,
  reportReview,
  getMeta,
  postReview
}

