import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  var url = 'http://localhost:3000/reviews/:review_id/report';
  // var payload = JSON.stringify({
  //   email: 'aaa',
  //   password: 'bbb',
  // });

  var params = {
    headers: {
      'Content-Type': 'application/json',
      'review_id': 19327572,
    },
  };

  http.put(url, params);
  sleep(1);
}