terraform {
    required_providers {
      aws = {
        source = "harshicorp/aws"
        # version = "value"
      }
    }
    backend "s3" {
      bucket = "kola-playground"
      key = "tfremotestate/layer00"
      region = var.region
    }
    # required_version = "value"
}

provider "aws" {
  region = var.region
}
