import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5,
  duration: "10s",
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    checks: ["rate>0.95"]
  }
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:4000";

export default function () {
  const health = http.get(`${BASE_URL}/health`);
  check(health, {
    "health status 200": (r) => r.status === 200,
    "health under 500ms": (r) => r.timings.duration < 500
  });
  sleep(0.5);
}
