resource "aws_instance" "my_ec2" {
  ami                         = "ami-0c614dee691cbbf37" # Replace with a valid AMI ID
  instance_type               = "t2.micro"
  iam_instance_profile        = data.terraform_remote_state.layer01.outputs.aws_iam_instance_profile.name
  key_name                    = aws_key_pair.example.key_name
  vpc_security_group_ids      = [data.terraform_remote_state.layer00.outputs.secuirty_group_id]
  subnet_id                   = data.terraform_remote_state.layer00.outputs.public_subnet.id
  associate_public_ip_address = true
}