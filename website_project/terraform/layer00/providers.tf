terraform {
  required_providers {
    aws = {
      source  = "harshicorp/aws"
      version = "5.67"
    }
  }
  backend "s3" {
    bucket = "kola-playground"
    key    = "tfremotestate/layer00"
    #   dynamodb_table = "TfStateLock"
    region = "us-east-1"
  }
  # required_version = "value"
}

provider "aws" {
  region = var.region
}
