output "aws_instance" {
  value = aws_instance.my_ec2
}

output "public_dns" {
  value = aws_instance.my_ec2.public_dns
}