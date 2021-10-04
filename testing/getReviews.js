import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 1000,
  duration: '60s',
};

export default function () {
  var url = 'http://localhost:3000/reviews';
  // var payload = JSON.stringify({
  //   email: 'aaa',
  //   password: 'bbb',
  // });

  var params = {
    headers: {
      'Content-Type': 'application/json',
      'product_id': 1000011,
      'page': 0,
      'count': 10,
    },
  };

  http.get(url, params);
  sleep(1);
}