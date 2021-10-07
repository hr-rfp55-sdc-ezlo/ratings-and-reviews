const { Pool, Client } = require('pg')
// pools will use environment variables
// for connection information
const pool = new Pool({
  user: 'derek',
  password: '',
  // host: 'localhost',
  host: 'ec2-18-118-107-137.us-east-2.compute.amazonaws.com',
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
  var sort;
  if (params.sort === 'helpfulness') {
    sort = "helpfulness";
  }
  // if (params.sort === 'relevance') {
  //   sort =
  // }
  if (params.sort === 'newest') {
    sort = "date";
  }
  var query = `SELECT
  product_id as product,
  json_agg(
    json_build_object(
          'review_id', rid, 'rating', rating, 'summary', summary, 'recommend', recommend, 'response', response, 'body', body, 'date', date, 'reviewer_name', reviewer_name, 'helpfulness', helpfulness, 'photos', photos
    )
  ORDER BY ${sort} DESC
  )
FROM
  (SELECT
    product_id, rid, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, COALESCE(json_agg(json_build_object('id', rpid, 'url', url)) FILTER (WHERE rpid IS NOT NULL), '[]') photos
  FROM
    (SELECT
      r.product_id, r.id as rid, r.rating, r.summary, r.recommend, r.response, r.body, r.date, r.reviewer_name, r.helpfulness, rp.id as rpid, rp.url
    FROM
      reviews r
    LEFT OUTER JOIN
      reviews_photos rp
    ON
      r.id = rp.review_id
    WHERE
      r.product_id = $1) t1
  GROUP BY
    product_id, rid, rating, summary, recommend, recommend, response, body, date, reviewer_name, helpfulness) t2
GROUP BY
  product_id
  LIMIT $2
  OFFSET $3`;
  // if (params.sort === 'helpfulness') {
  //   sort =
  // }
  var values = [params.product_id, params.count, params.count * params.page];

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
SELECT
  product_id as product,
  json_agg(
    json_build_object(
          'review_id', rid, 'rating', rating, 'summary', summary, 'recommend', recommend, 'response', response, 'body', body, 'date', date, 'reviewer_name', reviewer_name, 'helpfulness', helpfulness, 'photos', photos
    )
  ORDER BY "helpfulness" DESC
  )
FROM
  (SELECT
    product_id, rid, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, COALESCE(json_agg(json_build_object('id', rpid, 'url', url)) FILTER (WHERE rpid IS NOT NULL), '[]') photos
  FROM
    (SELECT
      r.product_id, r.id as rid, r.rating, r.summary, r.recommend, r.response, r.body, r.date, r.reviewer_name, r.helpfulness, rp.id as rpid, rp.url
    FROM
      reviews r
    LEFT OUTER JOIN
      reviews_photos rp
    ON
      r.id = rp.review_id
    WHERE
      r.product_id = 40334) t1
  GROUP BY
    product_id, rid, rating, summary, recommend, recommend, response, body, date, reviewer_name, helpfulness) t2
GROUP BY
  product_id

        )
      ORDER BY ${sort} DESC
    ) results
  FROM reviews r
  LEFT JOIN (
    SELECT
      review_id,
      json_agg(
        json_build_object(
          'id',
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
  LIMIT $2
  OFFSET $3
*/

const getMeta = (params, callback) => {
  var query = `SELECT
  r.product_id,
  json_build_object(
    '1', count(CASE r.rating WHEN 1 THEN 1 ELSE NULL END),
    '2', count(CASE r.rating WHEN 2 THEN 1 ELSE NULL END),
    '3', count(CASE r.rating WHEN 3 THEN 1 ELSE NULL END),
    '4', count(CASE r.rating WHEN 4 THEN 1 ELSE NULL END),
    '5', count(CASE r.rating WHEN 5 THEN 1 ELSE NULL END)
  ) ratings,
  json_build_object(
    '0', count(CASE r.recommend WHEN true THEN 1 ELSE NULL END),
    '1', count(CASE r.recommend WHEN false THEN 1 ELSE NULL END)
  ) recommended,
  json_object_agg(
    c.name,
    json_build_object(
      'id', cr.characteristic_id,
      'value', cr.value
    )
  ) AS characteristics
FROM
  reviews r
LEFT JOIN
  characteristics c
ON
  c.product_id = r.product_id
LEFT JOIN
  characteristic_reviews cr
ON
  cr.characteristic_id = c.id
WHERE
  r.product_id = $1
GROUP BY
  r.product_id`;
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
/**
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
  var query = `WITH
  review as (
    INSERT INTO
      reviews (product_id, rating, date, summary, body, recommend, reviewer_name, email)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id as r_id
  )
  INSERT INTO characteristic_reviews (review_id, value, characteristic_id)
  VALUES
  ((SELECT r_id FROM review), $9,
    (SELECT
      c.id
    FROM
      characteristics c
    WHERE
      c.product_id = $1 AND c.name = 'Size'
    )
  ),
  ((SELECT r_id FROM review), $10,
    (SELECT
      c.id
    FROM
      characteristics c
    WHERE
      c.product_id = $1 AND c.name = 'Width'
    )
  ),
  ((SELECT r_id FROM review), $11,
    (SELECT
      c.id
    FROM
      characteristics c
    WHERE
      c.product_id = $1 AND c.name = 'Comfort'
    )
  ),
  ((SELECT r_id FROM review), $12,
    (SELECT
      c.id
    FROM
      characteristics c
    WHERE
      c.product_id = $1 AND c.name = 'Quality'
    )
  ),
  ((SELECT r_id FROM review), $13,
    (SELECT
      c.id
    FROM
      characteristics c
    WHERE
      c.product_id = $1 AND c.name = 'Length'
    )
  ),
  ((SELECT r_id FROM review), $14,
    (SELECT
      c.id
    FROM
      characteristics c
    WHERE
      c.product_id = $1 AND c.name = 'Fit'
    )
  )`;
  var values = [params.product_id,
    params.rating,
    params.date,
    params.summary,
    params.body,
    params.recommend,
    params.reviewer_name,
    params.email,
    params.characteristics.size,
    params.characteristics.width,
    params.characteristics.comfort,
    params.characteristics.quality,
    params.characteristics.length,
    params.characteristics.fit]; //CHECK HOW DATA IS SENT FROM APP

  pool.query(query, values, (err, res) => {
    if (err) {
      callback(err);
    } else {
      callback(null, res.rows);
    }
  });

}

/**
WITH
  review as (
    INSERT INTO
      reviews (product_id, rating, date, summary, body, recommend, reviewer_name, email)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  )
INSERT INTO
  characteristic_reviews (review_id, value, characteristic_id)
VALUES
  (review.id, $9,
    (SELECT
      id
    FROM
      characteristics c
    WHERE
      c.product_id = $1 && c.name == 'Size'
    )
  ),
  (review.id, $10,
    (SELECT
      id
    FROM
      characteristics c
    WHERE
      c.product_id = $1 && c.name == 'Width'
    )
  ),
  (review.id, $11,
    (SELECT
      id
    FROM
      characteristics c
    WHERE
      c.product_id = $1 && c.name == 'Comfort'
    )
  ),
  (review.id, $12,
    (SELECT
      id
    FROM
      characteristics c
    WHERE
      c.product_id = $1 && c.name == 'Quality'
    )
  ),
  (review.id, $13,
    (SELECT
      id
    FROM
      characteristics c
    WHERE
      c.product_id = $1 && c.name == 'Length'
    )
  ),
  (review.id, $14,
    (SELECT
      id
    FROM
      characteristics c
    WHERE
      c.product_id = $1 && c.name == 'Fit'
    )
  )


WITH
  review as (
    INSERT INTO
      reviews (product_id, rating, date, summary, body, recommend, reviewer_name, email)
    VALUES (40335, 5, 1633368590450, 'Best ever', 'This is the best thing Ive ever bought.', true, 'derek', 'very@happy.com')
    RETURNING id
  )
INSERT INTO
  characteristic_reviews (review_id, value, characteristic_id)
VALUES
  ((SELECT id FROM review), 5,
    (SELECT
      id
    FROM
      characteristics c
    WHERE
      c.product_id = 40355 AND c.name = 'Size'
    )
  ),
  ((SELECT id FROM review), 5,
    (SELECT
      id
    FROM
      characteristics c
    WHERE
      c.product_id = 40355 AND c.name = Width'
    )
  ),
  ((SELECT id FROM review), 5,
    (SELECT
      id
    FROM
      characteristics c
    WHERE
      c.product_id = 40355 AND c.name = 'Comfort'
    )
  ),
  ((SELECT id FROM review), 5,
    (SELECT
      id
    FROM
      characteristics c
    WHERE
      c.product_id = 40355 AND c.name = 'Quality'
    )
  ),
  ((SELECT id FROM review), 5,
    (SELECT
      id
    FROM
      characteristics c
    WHERE
      c.product_id = 40355 AND c.name = 'Length'
    )
  ),
  ((SELECT id FROM review), 5,
    (SELECT
      id
    FROM
      characteristics c
    WHERE
      c.product_id = 40355 AND c.name = 'Fit'
    )
  );
 */



module.exports = {
  pool,
  getReviews,
  markHelpful,
  reportReview,
  getMeta,
  postReview
}

