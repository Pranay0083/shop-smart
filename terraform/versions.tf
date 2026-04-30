terraform {
  required_version = ">= 1.5.0"

  backend "s3" {
    bucket = "shopsmart-pranay-tfstate"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
