resource "aws_eip" "my_ec2" {
  instance = aws_instance.my_ec2.id
}