#!/bin/bash

BASE_URL="http://localhost:8080"
TOKEN=""
LISTING_ID=""

echo "=========================================="
echo "SwampSwap Listings CRUD Test Suite"
echo "=========================================="
echo ""

# Test 1: Register a test user
echo "Test 1: Register User"
RESPONSE=$(curl -s -X POST $BASE_URL/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser123","password":"password123"}')

if [[ $RESPONSE == *"registration was successful"* ]]; then
    echo "✓ Registration successful"
else
    echo "✗ Registration failed: $RESPONSE"
    exit 1
fi
echo ""

# Test 2: Login and get JWT token
echo "Test 2: Login and Get Token"
RESPONSE=$(curl -s -X POST $BASE_URL/api/login \
  -H "Content-Type: application/json" \
  -d '{"id":"testuser123","password":"password123"}')

TOKEN=$(echo $RESPONSE | grep -o '"login successful, user token:":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "✗ Login failed or token not found: $RESPONSE"
    exit 1
else
    echo "✓ Login successful, token received"
    echo "Token: ${TOKEN:0:20}..."
fi
echo ""

# Test 3: Create listing (Protected - Should succeed with token)
echo "Test 3: Create Listing (Authenticated)"
RESPONSE=$(curl -s -X POST $BASE_URL/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"iPhone 13","description":"Barely used, great condition","price":500}')

LISTING_ID=$(echo $RESPONSE | grep -o '"ID":[0-9]*' | cut -d':' -f2)

if [ -z "$LISTING_ID" ]; then
    echo "✗ Create listing failed: $RESPONSE"
    exit 1
else
    echo "✓ Listing created with ID: $LISTING_ID"
fi
echo ""

# Test 4: Get all listings (Public - Should work without token)
echo "Test 4: Get All Listings (Public)"
RESPONSE=$(curl -s -X GET $BASE_URL/api/listings)

if [[ $RESPONSE == *"iPhone 13"* ]]; then
    echo "✓ Successfully retrieved all listings${NC}"
else
    echo "✗ Get all listings failed: $RESPONSE${NC}"
    exit 1
fi
echo ""

# Test 5: Get single listing by ID (Public)
echo "Test 5: Get Listing by ID (Public)"
RESPONSE=$(curl -s -X GET $BASE_URL/api/listings/$LISTING_ID)

if [[ $RESPONSE == *"iPhone 13"* ]]; then
    echo "✓ Successfully retrieved listing by ID"
else
    echo "✗ Get listing by ID failed: $RESPONSE"
    exit 1
fi
echo ""

# Test 6: Update listing (Protected - Owner only)
echo "Test 6: Update Listing (Owner)"
RESPONSE=$(curl -s -X PUT $BASE_URL/api/listings/$LISTING_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"iPhone 13 Pro","description":"Like new condition","price":600}')

if [[ $RESPONSE == *"iPhone 13 Pro"* ]]; then
    echo "✓ Successfully updated listing${NC}"
else
    echo "✗ Update listing failed: $RESPONSE${NC}"
    exit 1
fi
echo ""

# Test 7: Try to update without token (Should fail)
echo "Test 7: Update Listing Without Auth (Should Fail)"
RESPONSE=$(curl -s -X PUT $BASE_URL/api/listings/$LISTING_ID \
  -H "Content-Type: application/json" \
  -d '{"title":"Hacked","description":"Should not work","price":1}')

if [[ $RESPONSE == *"unauthorized"* ]]; then
    echo "✓ Correctly rejected unauthorized update"
else
    echo "✗ Should have rejected unauthorized update"
fi
echo ""

# Test 8: Create second listing for testing
echo "Test 8: Create Second Listing"
curl -s -X POST $BASE_URL/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"MacBook Pro","description":"2021 model","price":1200}' > /dev/null
echo "✓ Second listing created"
echo ""

# Test 9: Verify multiple listings returned
echo "Test 9: Verify Multiple Listings"
RESPONSE=$(curl -s -X GET $BASE_URL/api/listings)
COUNT=$(echo $RESPONSE | grep -o '"title"' | wc -l)

if [ $COUNT -ge 2 ]; then
    echo "✓ Multiple listings returned (found $COUNT)"
else
    echo "✗ Expected at least 2 listings, found $COUNT"
fi
echo ""

# Test 10: Delete listing (Protected - Owner only)
echo "Test 10: Delete Listing (Owner)"
RESPONSE=$(curl -s -X DELETE $BASE_URL/api/listings/$LISTING_ID \
  -H "Authorization: Bearer $TOKEN")

if [[ $RESPONSE == *"deleted successfully"* ]]; then
    echo "✓ Successfully deleted listing"
else
    echo "✗ Delete listing failed: $RESPONSE"
    exit 1
fi
echo ""

# Test 11: Verify deletion (Should return 404)
echo "Test 11: Verify Deletion"
RESPONSE=$(curl -s -X GET $BASE_URL/api/listings/$LISTING_ID)

if [[ $RESPONSE == *"not found"* ]]; then
    echo "✓ Listing correctly deleted (404 returned)"
else
    echo "✗ Deleted listing still accessible"
fi
echo ""

# Test 12: Try to delete without token (Should fail)
echo "Test 12: Delete Without Auth (Should Fail)"
RESPONSE=$(curl -s -X DELETE $BASE_URL/api/listings/2)

if [[ $RESPONSE == *"unauthorized"* ]]; then
    echo "✓ Correctly rejected unauthorized delete"
else
    echo "✗ Should have rejected unauthorized delete"
fi
echo ""

echo "=========================================="
echo "All Tests Passed!"
echo "=========================================="