#!/bin/bash

# ⚠️  BAD PRACTICE - Never hardcode credentials in scripts!
# This is for demonstration/testing purposes only.

# Dummy AWS Credentials (not real)
AWS_ACCESS_KEY_ID="EXAMPLE"
AWS_SECRET_ACCESS_KEY="EXAMPLE"
AWS_DEFAULT_REGION="us-west-2"

# Export for AWS CLI
export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION

# Bucket configuration
BUCKET_NAME="my-app-data-prod-20260211"
TAGS="Key=Environment,Value=Production Key=Team,Value=Platform"

# Create the S3 bucket
echo "Creating S3 bucket: ${BUCKET_NAME}"

aws s3api create-bucket \
    --bucket "${BUCKET_NAME}" \
    --region "${AWS_DEFAULT_REGION}" \
    --create-bucket-configuration LocationConstraint="${AWS_DEFAULT_REGION}"

echo "Bucket ${BUCKET_NAME} created successfully."