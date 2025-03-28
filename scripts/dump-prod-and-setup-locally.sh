#!/usr/bin/env bash

# Parse arguments
while [ $# -gt 0 ]
do
  case "$1" in
    --prodMongoUsername=*)
      PROD_MONGO_USERNAME="${1#*=}"
      ;;
    --prodMongoPassword=*)
      PROD_MONGO_PASSWORD="${1#*=}"
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
  shift
done

if command -v mongo &> /dev/null
then
  MONGO_CMD=mongo
else
  if command -v mongosh &> /dev/null
  then
    MONGO_CMD=mongosh
  else
    echo "Neither 'mongo' nor 'mongosh' is installed. Please install one of them." >&2
    exit 1
  fi
fi

# Prompt for or check required variables
if [ -z "$PROD_MONGO_USERNAME" ]; then
  echo "Please set --prodMongoUsername={username}" >&2
  exit 1
fi

if [ -z "$PROD_MONGO_PASSWORD" ]; then
  echo "Please set --prodMongoPassword={password}" >&2
  exit 1
fi

# Resolve ~ to the current user's home directory
DOWNLOAD_PATH="$HOME/Downloads/prod-farmshare-dump"

if [ -d "$DOWNLOAD_PATH" ]; then
  echo "Removing existing dump directory at $DOWNLOAD_PATH"
  rm -rf "$DOWNLOAD_PATH"
fi

# Dump production data
echo
echo "==> Dumping production database..."
mongodump \
  --uri "mongodb+srv://$PROD_MONGO_USERNAME:$PROD_MONGO_PASSWORD@middleware-prod-f902cf80.mongo.ondigitalocean.com/farmshare-partners?tls=true&authSource=admin&replicaSet=middleware-prod" \
  --out "$DOWNLOAD_PATH"

if [ $? -ne 0 ]; then
  echo
  echo "[ERROR] mongodump failed. Check your credentials or permissions." >&2
  exit 1
fi

# Drop local DB
echo
echo "==> Dropping local farmshare-partners database..."
$MONGO_CMD farmshare-partners --eval "db.dropDatabase()"

# Import dump into local
echo
echo "==> Restoring from local dump..."
mongorestore --host localhost --port 27017 --db farmshare-partners $DOWNLOAD_PATH/farmshare-partners

if [ $? -ne 0 ]; then
  echo
  echo "[ERROR] mongorestore failed. Check your local Mongo service." >&2
  exit 1
fi

# Update automated@tester.com user's token and external ID
echo
echo "==> Updating automated@tester.com user with new access_token and external_id..."
$MONGO_CMD farmshare-partners --eval "db.Users.updateOne(  { email: 'automated@tester.com' },  {     \$set: {       access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjJfRnRHZUhiZ1pxU2YxUUh2YjBzZSJ9.eyJmYXJtL2VtYWlsIjoiYXV0b21hdGVkQHRlc3Rlci5jb20iLCJmYXJtL3R5cGUiOiJmdWxsIiwiaXNzIjoiaHR0cHM6Ly9kZXYtaHcyamE2Znh1ZnRlMWtwMy51cy5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjdhYmI3YzVhYTBhYWM2ZDBiY2ViZTAxIiwiYXVkIjpbImh0dHBzOi8vYXBpLmZhcm1zaGFyZS5jbyIsImh0dHBzOi8vZGV2LWh3MmphNmZ4dWZ0ZTFrcDMudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTc0Mjc1NTc5MCwiZXhwIjoxNzQyODQyMTkwLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIHBob25lIG9mZmxpbmVfYWNjZXNzIiwiYXpwIjoiY05yc3hWUTVLNzdaeFB2OFdsQTVFOUhWRzhkVmxQQUoiLCJwZXJtaXNzaW9ucyI6WyJ1c2VyIl19.nndTYgerzKlADm9l56JuXMyBNBHOp1MtEWeClas_jE8Y2qk_h3utG5kgLfjofc-CFjrKQtC8qcadI9VzN9tePnlitDKDO4oR9nAX10eJiFpyBVhEXOGMxsZ73ZF90cKeorOzhVODFLUWr2rsXhnYoMUuoFg07nE8Z5ZRcmcWX64bqEIs_6UlX4CzHCBIy2Iv7VRQA4Lf-bL9uVh9MRW9lO5C0eK47qcQEaVwGO0MqKw9WcLi2GZgyDy9uctGLm2k4VjlnXDGvvUO_EBvPhCgUBHbikHt5AurZ9Qz9qQCDBzmzhCZ3IV8HtUbT5HokklGPEOJXClY9jYVxso6RFSZ-Q',     external_id: 'auth0|67abb44c0944a0938990cf7f'   } })"

if [ $? -ne 0 ]; then
  echo
  echo "[ERROR] Could not update the automated@tester.com user." >&2
  exit 1
fi

echo
echo "Done!"