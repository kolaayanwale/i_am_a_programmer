terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.67.0"
    }
  }
  backend "s3" {
    bucket = "kola-playground"
    key    = "tfremotestate/layer01"
    #   dynamodb_table = "TfStateLock"
    region = "us-east-1"
  }
  required_version = "1.9.5"
}

provider "aws" {
  region = "us-east-1"
}
