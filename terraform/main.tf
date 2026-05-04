terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote backend to persist state between CI/CD runs.
  # This ensures Terraform remembers what it already created
  # and won't try to recreate existing resources.
  # The state bucket is bootstrapped by the workflow before terraform init.
  backend "s3" {
    bucket = "shopsmart12345678"
    key    = "infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# ---------------------------------------------------------
# Phase 2 Rubric: S3 Bucket Configuration (Application Bucket)
# ---------------------------------------------------------

# Use a deterministic bucket name (no random_id) so it's idempotent across runs.
# The unique suffix comes from the AWS Account ID to avoid global name collisions.
data "aws_caller_identity" "current" {}

# 1. Unique bucket name (deterministic, uses AWS account ID as suffix)
resource "aws_s3_bucket" "app_bucket" {
  bucket = "${var.app_name}-app-bucket-${data.aws_caller_identity.current.account_id}"

  # Prevent accidental deletion of this bucket
  lifecycle {
    prevent_destroy = true
  }
}

# 2. Versioning enabled
resource "aws_s3_bucket_versioning" "app_bucket_versioning" {
  bucket = aws_s3_bucket.app_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# 3. Encryption enabled (AES256)
resource "aws_s3_bucket_server_side_encryption_configuration" "app_bucket_encryption" {
  bucket = aws_s3_bucket.app_bucket.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 4. Public access blocked
resource "aws_s3_bucket_public_access_block" "app_bucket_public_access_block" {
  bucket = aws_s3_bucket.app_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
