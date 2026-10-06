#!/bin/bash
B="http://127.0.0.1:8080/v1/projects/demo-quickbite/databases/(default)/documents"
echo "anonymous create order:     $(curl -s -o /dev/null -w '%{http_code}' -X POST "$B/orders" -H 'Content-Type: application/json' -d '{"fields":{"userId":{"stringValue":"x"},"grandTotal":{"integerValue":"1"},"status":{"stringValue":"placed"}}}')"
echo "anonymous read payments:    $(curl -s -o /dev/null -w '%{http_code}' "$B/payments")"
echo "anonymous read coupons:     $(curl -s -o /dev/null -w '%{http_code}' "$B/coupons")"
echo "anonymous edit a restaurant: $(curl -s -o /dev/null -w '%{http_code}' -X PATCH "$B/restaurants/r1?updateMask.fieldPaths=rating" -H 'Content-Type: application/json' -d '{"fields":{"rating":{"doubleValue":5}}}')"
echo "anonymous read restaurants: $(curl -s -o /dev/null -w '%{http_code}' "$B/restaurants")"
