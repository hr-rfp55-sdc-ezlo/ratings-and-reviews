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
  var query = 'SELECT * FROM reviews WHERE product_id = $1 ORDER BY $2 LIMIT $3 OFFSET $4';
  var values = [params.product_id, params.sort, params.count, params.count * params.page];

  pool.query(query, values, (err, res) => {
    if (err) {
      callback(err);
    } else {
      callback(null, res.rows);
    }
  });
}

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

// getMeta:
//   pool
//     .query(text, values)
//     .then(res => {
//       console.log(res)
//     })
//     .catch(e => console.error(e))
//READ UP ON QUERIES
// BIG AGGREGATE WITH AVERAGES AND NESTED OBJECTS
// 'SELECT avg(value) FROM characteristic_reviews WHERE characteristic_id = #'
// 'SELECT characteristic_id, avg(value) FROM characteristic_reviews WHERE characteristic_id < 5;'
/**
 SELECT
    product_id
    , count(rating = 1)
    , count(rating = 2)
    , count(rating = 3)
    , count(rating = 4)
    , count(rating = 5)
    , count(recommend = f)
    , count(recommend = t)
    , column_3
    , nested.column_4
FROM
    (
    SELECT
        column_4
    FROM
        tbl_data
    WHERE
        [condition]
    ) AS nested;

SELECT
    characteristic_id,
    avg(value)
FROM
    characteristic_reviews
WHERE
    characteristic_id = (SELECT id FROM characteristics WHERE product_id = 40344)
GROUP BY
    characteristic_id;


SELECT
  count(CASE rating WHEN 1 THEN 1 ELSE NULL END) as one,
  count(CASE rating WHEN 2 THEN 2 ELSE NULL END) as two,
  count(CASE rating WHEN 3 THEN 3 ELSE NULL END) as three,
  count(CASE rating WHEN 4 THEN 4 ELSE NULL END) as four,
  count(CASE rating WHEN 5 THEN 5 ELSE NULL END) as five
FROM
  reviews as ratings
WHERE
  product_id = 40344

SELECT
  count(CASE rating WHEN 1 THEN 1 ELSE NULL END) as "1",
  count(CASE rating WHEN 2 THEN 1 ELSE NULL END) as "2",
  count(CASE rating WHEN 3 THEN 1 ELSE NULL END) as "3",
  count(CASE rating WHEN 4 THEN 1 ELSE NULL END) as "4",
  count(CASE rating WHEN 5 THEN 1 ELSE NULL END) as "5"
  count(CASE recommended WHERE true THEN)
FROM
  reviews as ratings
WHERE
  product_id = 40344

 */


// const postReview = (params, callback) => {
//   var query = 'INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reviewer_name, email) VALUES ()';
//   var values = [] //CHECK HOW DATA IS SENT FROM APP
//   pool
//       .query(, values)
//       .then(res => {
//         console.log(res)
//       })
//       .catch(e => console.error(e))
//       .then('INSERT INTO characteristic-reviews () VALUES ()')

// }



module.exports = {
  pool,
  getReviews,
  markHelpful,
  reportReview

}

