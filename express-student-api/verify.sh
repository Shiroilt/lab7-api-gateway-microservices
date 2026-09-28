#!/usr/bin/env bash
set -e
BASE="http://localhost:3000"
echo "GET all:"
curl -s -i "$BASE/students"
echo
echo "GET invalid ID:"
curl -s -i "$BASE/students/9999"
echo
echo "POST invalid body:"
curl -s -i -X POST "$BASE/students" -H "Content-Type: application/json" -d '{"name":"","email":"invalid-email","semester":-2}'
echo
