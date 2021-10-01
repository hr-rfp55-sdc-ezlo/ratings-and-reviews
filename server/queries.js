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
// BIG AGGREGATE WITH AVERGATES AND NESTED OBJECTS



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

