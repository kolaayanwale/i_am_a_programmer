terraform {
    required_providers {
      aws = {
        source = "harshicorp/aws"
        # version = "value"
      }
    }
    # required_version = "value"
}

provider "aws" {
  region = "us-east-1"
}
