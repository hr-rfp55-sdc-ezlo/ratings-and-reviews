import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 1000,
  duration: '30s',
};

export default function () {
  var url = 'http://localhost:3000/reviews/:review_id/helpful';
  // var payload = JSON.stringify({
  //   email: 'aaa',
  //   password: 'bbb',
  // });

  var params = {
    headers: {
      'Content-Type': 'application/json',
      'review_id': 5774950,
    },
  };

  http.put(url, params);
  sleep(1);
}