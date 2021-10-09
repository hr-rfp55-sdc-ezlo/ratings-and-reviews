const express = require('express');
const path = require('path');
const PORT = 3000;
const cors = require('cors');
const app = express();
const pg = require('./queries.js');
// const db = require('./database/index.sql')

app.use(cors());
// app.use(express.static('/reviews'));
app.use(express.static(`${__dirname}/../public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//listeners for API requests
//GET reviews (by product id)
  //specifies page of results and results per page
  //specifies how to sort
  //does not include reported reviews
/* user server code:
router.get('/reviews/:product_id', (req, res) => {
  axios.get(`https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfp/reviews/?sort=newest&product_id=${req.params.product_id}&count=100`, {
    headers: { Authorization: authToken },
  })
    .then((response) => {
      res.send(response.data);
    })
    .catch((err) => res.send(err));
  });

  app.get('/reviews', (req, res) => {
    ratings.getReviews(req.query, (err, data) => {
      if (err) {
        console.log('Error app.get /reviews/ : ' + err);
        res.status(404).send(err);
      } else {
        res.status(200).send(data);
      }
    });
  })
  */

app.get('/reviews', (req, res) => {
   var params = {
     product_id: req.query.product_id || 1000011,
     sort: req.query.sort || "helpfulness",
     count: req.query.count || 10,
     page: req.query.page || 0,
    };
    console.log('GET request received:', req.headers);
    console.log('params:', params);

    pg.getReviews(params, (err, data) => {
      if (err) {
        console.log('Error getting reviews from db:' + err.stack);
        res.status(404).send(err.stack);
      } else {
        console.log('data:', data);
        res.status(200).json(data);
      }
    });
})

  //GET review metadata
    //takes in product id
  /* user server code:
  router.get('/reviews/meta/:product_id', (req, res) => {
    axios.get(`https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfp/reviews/meta/?sort=newest&product_id=${req.params.product_id}&count=100`, {
      headers: { Authorization: authToken },
    })
    .then((response) => {
      res.send(response.data);
    })
    .catch((err) => res.send(err));
  });
  */

app.get('/reviews/meta', (req, res) => {
  var params = {
    product_id: req.query.product_id
    };
    console.log('GET meta req recd:', req.query);
    console.log('params:', params);

    pg.getMeta(params, (err, data) => {
      if (err) {
        console.log('Error getting metadata from db:' + err);
        res.status(404).send(err);
      } else {
        console.log('data:', data);
        res.status(200).json(data);
      }
    });
})


  //PUT to mark review as helpful
  //takes review ID
/* user server code (for QA, no such code for reviews):
router.put('/qa/questions/helpful/:question_id', (req, res) => {
  axios.put(`https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfp/qa/questions/${req.params.question_id}/helpful`, {}, {
    headers: { Authorization: authToken },
  })
    .then((response) => {
      res.send(response.data);
    })
    .catch((err) => res.send(err));
});
*/
app.put('/reviews/:review_id/helpful', (req, res) => {
  var params = {
    review_id: req.query.review_id
  };
  console.log('PUT helpful req recd:', req.query);

  pg.markHelpful(params, (err, data) => {
    if (err) {
      console.log('Can\'t mark helpful; error on PUT req:' + err);
      res.status(404).send(err);
    } else {
      res.status(204).send(data);
    }
  });
})




//POST review
  //takes in multiple parameters
/* user server code:
router.post('/reviews', (req, res) => {
  const newReview = req.body;
  const headers = {
    Authorization: authToken,
    'Content-Type': 'application/json',
  };

  axios.post('https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfp/reviews', newReview, { headers })
    .then((result) => {
      console.log('successful review form post :) ');
      res.status(200);
      res.send(result.data);
    })
    .catch((err) => {
      res.status(400);
      res.end('Unable to complete post request for review form submission');
    });
});
*/
app.post('/reviews', (req, res) => {
  var date = new Date();
  var characteristics = {
    size: req.query.characteristics.Size || null,
    width: req.query.characteristics.Width || null,
    comfort: req.query.characteristics.Comfort || null,
    quality: req.query.characteristics.Quality || null,
    length: req.query.characteristics.Length || null,
    fit: req.query.characteristics.Fit || null
  }
  var params = {
    product_id: req.query.product_id,
    rating: req.query.rating,
    date: date.valueOf(),
    summary: req.query.summary,
    body: req.query.body,
    recommend: req.query.recommend,
    reviewer_name: req.query.reviewer_name,
    email: req.query.email,
    photos: req.query.photos,
    characteristics: req.query.characteristics
   };
   console.log('POST request received:', req.query);
   console.log('params:', params);

   pg.postReview(params, (err, data) => {
     if (err) {
       console.log('Error posting reviews to db:' + err);
       res.status(404).send(err);
     } else {
       console.log('data:', data);
       res.status(200).json(data);
     }
   });
})





//PUT to report review
  //takes review ID
/* user server code (for QA, no such code for reviews):
router.put('/qa/answers/report/:answer_id', (req, res) => {
  axios.put(`https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfp/qa/answers/${req.params.answer_id}/report`, {}, {
    headers: { Authorization: authToken },
  })
    .then((response) => {
      res.send(response.data);
    })
    .catch((err) => res.send(err));
});
 */
// app.put()
app.put('/reviews/:review_id/report', (req, res) => {
  var params = {
    review_id: req.query.review_id
  };
  console.log('PUT report req recd:', req.query);

  pg.reportReview(params, (err, data) => {
    if (err) {
      console.log('Can\'t mark reported; error on PUT req:' + err);
      res.status(404).send(err);
    } else {
      res.status(204).send(data);
    }
  });
})


app.listen(PORT, () => {
  console.log(`Listening at localhost:${PORT}!`)
})