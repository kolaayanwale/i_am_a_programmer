data "terraform_remote_state" "layer00" {
  backend = "s3"
  config = {
    bucket = "kola-playground"
    key    = "tfremotestate/layer00"
    region = "us-east-1"
  }
}

data "terraform_remote_state" "layer01" {
  backend = "s3"
  config = {
    bucket = "kola-playground"
    key    = "tfremotestate/layer01"
    region = "us-east-1"
  }
}

