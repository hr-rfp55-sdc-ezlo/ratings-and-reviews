const { Pool, Client } = require('pg')
// pools will use environment variables
// for connection information
const pool = new Pool({
  user: 'derek',
  password: '',
  // host: 'localhost',
  host: 'ec2-18-118-107-137.us-east-2.compute.amazonaws.com',
  // host: '18.118.107.137',
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
  if (params.sort === 'relevant') {
    sort = "helpfulness";
  }
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
  ) as results
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
      r.product_id = $1
    LIMIT $2
    OFFSET $3
    ) t1
  GROUP BY
    product_id, rid, rating, summary, recommend, recommend, response, body, date, reviewer_name, helpfulness) t2
GROUP BY
  product_id`;
  // if (params.sort === 'helpfulness') {
  //   sort =
  // }
  var values = [params.product_id, params.count, params.count * params.page];

  pool.query(query, values, (err, res) => {
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
LIMIT 4
OFFSET 0


*/

const getMeta = (params, callback) => {
  var query = `SELECT
  product_id,
  json_build_object(
    '1', count(CASE rating WHEN 1 THEN 1 ELSE NULL END),
    '2', count (CASE rating WHEN 2 THEN 1 ELSE NULL END),
    '3', count(CASE rating WHEN 3 THEN 1 ELSE NULL END),
    '4', count(CASE rating WHEN 4 THEN 1 ELSE NULL END),
    '5', count(CASE rating WHEN 5 THEN 1 ELSE NULL END)
  ) as ratings,
  json_build_object(
    '0', count(CASE recommend WHEN true THEN 1 ELSE NULL END),
    '1', count(CASE recommend WHEN false THEN 1 ELSE NULL END)
  ) as recommended,
  json_object_agg(name, cr_avg) as characteristics
FROM
  (SELECT
    product_id, rating, recommend, name, json_build_object('id', crid, 'value', AVG(value)) cr_avg
  FROM
    (SELECT
      r.product_id, r.rating, r.recommend, c.name, cr.characteristic_id as crid, cr.value
    FROM
      reviews r
    LEFT OUTER JOIN
      characteristics c
    ON
      c.product_id = r.product_id
    LEFT JOIN
      characteristic_reviews cr
    ON
      cr.characteristic_id = c.id
    WHERE
      r.product_id = $1) t1
  GROUP BY
  product_id, rating, recommend, name, crid) t2
GROUP BY
  product_id, rating, recommend`;
  var values = [params.product_id];

  pool.query(query, values, (err, res) => {
    if (err) {
      callback(err.stack);
    } else {
      callback(null, res.rows);
    }
  });
}
//READ UP ON QUERIES
// BIG AGGREGATE WITH AVERAGES AND NESTED OBJECTS
/**
SELECT
  product_id,
  json_build_object(
    '1', count(CASE rating WHEN 1 THEN 1 ELSE NULL END),
    '2', count (CASE rating WHEN 2 THEN 1 ELSE NULL END),
    '3', count(CASE rating WHEN 3 THEN 1 ELSE NULL END),
    '4', count(CASE rating WHEN 4 THEN 1 ELSE NULL END),
    '5', count(CASE rating WHEN 5 THEN 1 ELSE NULL END)
  ) as ratings,
  json_build_object(
    '0', count(CASE recommend WHEN true THEN 1 ELSE NULL END),
    '1', count(CASE recommend WHEN false THEN 1 ELSE NULL END)
  ) as recommended,
  json_object_agg(name, cr_avg) as characteristics
FROM
  (SELECT
    product_id, rating, recommend, name, json_build_object('id', crid, 'value', AVG(value)) cr_avg
  FROM
    (SELECT
      r.product_id, r.rating, r.recommend, c.name, cr.characteristic_id as crid, cr.value
    FROM
      reviews r
    LEFT OUTER JOIN
      characteristics c
    ON
      c.product_id = r.product_id
    LEFT JOIN
      characteristic_reviews cr
    ON
      cr.characteristic_id = c.id
    WHERE
      r.product_id = 1000011) t1
  GROUP BY
  product_id, rating, recommend, name, crid) t2
GROUP BY
  product_id, rating, recommend
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
;
 */



module.exports = {
  pool,
  getReviews,
  markHelpful,
  reportReview,
  getMeta,
  postReview
}

