terraform {
    required_providers {
      aws = {
        source = "harshicorp/aws"
        # version = "value"
      }
    }
    backend "s3" {
      bucket = "value"
      key = "value"
      region = var.region
    }
    # required_version = "value"
}

provider "aws" {
  region = "us-east-1"
}
