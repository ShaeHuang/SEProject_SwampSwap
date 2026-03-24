#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8080"
TOKEN=""
LISTING_ID=""

echo "=========================================="
echo "SwampSwap Listings CRUD Test Suite"
echo "=========================================="
echo ""

# Test 1: Register a test user
echo "${YELLOW}Test 1: Register User${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser123","password":"password123"}')

if [[ $RESPONSE == *"registration was successful"* ]]; then
    echo "${GREEN}✓ Registration successful${NC}"
else
    echo "${RED}✗ Registration failed: $RESPONSE${NC}"
    exit 1
fi
echo ""

# Test 2: Login and get JWT token
echo "${YELLOW}Test 2: Login and Get Token${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser123","password":"password123"}')

TOKEN=$(echo $RESPONSE | grep -o '"login successful, user token:":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "${RED}✗ Login failed or token not found: $RESPONSE${NC}"
    exit 1
else
    echo "${GREEN}✓ Login successful, token received${NC}"
    echo "Token: ${TOKEN:0:20}..."
fi
echo ""

# Test 3: Create listing (Protected - Should succeed with token)
echo "${YELLOW}Test 3: Create Listing (Authenticated)${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/api/admin/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"iPhone 13","description":"Barely used, great condition","price":500}')

LISTING_ID=$(echo $RESPONSE | grep -o '"ID":[0-9]*' | cut -d':' -f2)

if [ -z "$LISTING_ID" ]; then
    echo "${RED}✗ Create listing failed: $RESPONSE${NC}"
    exit 1
else
    echo "${GREEN}✓ Listing created with ID: $LISTING_ID${NC}"
fi
echo ""

# Test 4: Get all listings (Public - Should work without token)
echo "${YELLOW}Test 4: Get All Listings (Public)${NC}"
RESPONSE=$(curl -s -X GET $BASE_URL/api/listings)

if [[ $RESPONSE == *"iPhone 13"* ]]; then
    echo "${GREEN}✓ Successfully retrieved all listings${NC}"
else
    echo "${RED}✗ Get all listings failed: $RESPONSE${NC}"
    exit 1
fi
echo ""

# Test 5: Get single listing by ID (Public)
echo "${YELLOW}Test 5: Get Listing by ID (Public)${NC}"
RESPONSE=$(curl -s -X GET $BASE_URL/api/listings/$LISTING_ID)

if [[ $RESPONSE == *"iPhone 13"* ]]; then
    echo "${GREEN}✓ Successfully retrieved listing by ID${NC}"
else
    echo "${RED}✗ Get listing by ID failed: $RESPONSE${NC}"
    exit 1
fi
echo ""

# Test 6: Update listing (Protected - Owner only)
echo "${YELLOW}Test 6: Update Listing (Owner)${NC}"
RESPONSE=$(curl -s -X PUT $BASE_URL/api/admin/listings/$LISTING_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"iPhone 13 Pro","description":"Like new condition","price":600}')

if [[ $RESPONSE == *"iPhone 13 Pro"* ]]; then
    echo "${GREEN}✓ Successfully updated listing${NC}"
else
    echo "${RED}✗ Update listing failed: $RESPONSE${NC}"
    exit 1
fi
echo ""

# Test 7: Try to update without token (Should fail)
echo "${YELLOW}Test 7: Update Listing Without Auth (Should Fail)${NC}"
RESPONSE=$(curl -s -X PUT $BASE_URL/api/admin/listings/$LISTING_ID \
  -H "Content-Type: application/json" \
  -d '{"title":"Hacked","description":"Should not work","price":1}')

if [[ $RESPONSE == *"unauthorized"* ]]; then
    echo "${GREEN}✓ Correctly rejected unauthorized update${NC}"
else
    echo "${RED}✗ Should have rejected unauthorized update${NC}"
fi
echo ""

# Test 8: Create second listing for testing
echo "${YELLOW}Test 8: Create Second Listing${NC}"
curl -s -X POST $BASE_URL/api/admin/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"MacBook Pro","description":"2021 model","price":1200}' > /dev/null
echo "${GREEN}✓ Second listing created${NC}"
echo ""

# Test 9: Verify multiple listings returned
echo "${YELLOW}Test 9: Verify Multiple Listings${NC}"
RESPONSE=$(curl -s -X GET $BASE_URL/api/listings)
COUNT=$(echo $RESPONSE | grep -o '"title"' | wc -l)

if [ $COUNT -ge 2 ]; then
    echo "${GREEN}✓ Multiple listings returned (found $COUNT)${NC}"
else
    echo "${RED}✗ Expected at least 2 listings, found $COUNT${NC}"
fi
echo ""

# Test 10: Delete listing (Protected - Owner only)
echo "${YELLOW}Test 10: Delete Listing (Owner)${NC}"
RESPONSE=$(curl -s -X DELETE $BASE_URL/api/admin/listings/$LISTING_ID \
  -H "Authorization: Bearer $TOKEN")

if [[ $RESPONSE == *"deleted successfully"* ]]; then
    echo "${GREEN}✓ Successfully deleted listing${NC}"
else
    echo "${RED}✗ Delete listing failed: $RESPONSE${NC}"
    exit 1
fi
echo ""

# Test 11: Verify deletion (Should return 404)
echo "${YELLOW}Test 11: Verify Deletion${NC}"
RESPONSE=$(curl -s -X GET $BASE_URL/api/listings/$LISTING_ID)

if [[ $RESPONSE == *"not found"* ]]; then
    echo "${GREEN}✓ Listing correctly deleted (404 returned)${NC}"
else
    echo "${RED}✗ Deleted listing still accessible${NC}"
fi
echo ""

# Test 12: Try to delete without token (Should fail)
echo "${YELLOW}Test 12: Delete Without Auth (Should Fail)${NC}"
RESPONSE=$(curl -s -X DELETE $BASE_URL/api/admin/listings/2)

if [[ $RESPONSE == *"unauthorized"* ]]; then
    echo "${GREEN}✓ Correctly rejected unauthorized delete${NC}"
else
    echo "${RED}✗ Should have rejected unauthorized delete${NC}"
fi
echo ""

echo "=========================================="
echo "${GREEN}All Tests Passed!${NC}"
echo "=========================================="