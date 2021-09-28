const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fetcher', { useNewUrlParser: true });

// let productReviewsSchema = mongoose.Schema({
//     "id": mongoose.ObjectId,
//     "product": String,
//     "results": [] //nested
// });

let Product = mongoose.model('Product Reviews', productReviewsSchema);

let reviewSchema = mongoose.Schema({
  "id": mongoose.ObjectId,
  "product_id": Number,
  "review_id": Number,
  "rating": Number,
  "summary": String,
  "recommend": Boolean,
  "response": String,
  "body": String,
  "characteristics": {
    "Size": {
      "id": Number,
      "value": String
    },
    "Width": {
      "id": Number,
      "value": String
    },
    "Comfort": {
      "id": Number,
      "value": String
    },
    "Quality":  {
      "id": Number,
      "value": String
    },
    "Length":  {
      "id": Number,
      "value": String
    },
    "Fit":  {
      "id": Number,
      "value": String
    }
  },
  "date": String,
  "reviewer_name": String,
  "email": String,
  "helpfulness": Number,
  "photos": [{
    "id": Number,
    "url": String
  }], //nested
  "reported": Boolean
})
