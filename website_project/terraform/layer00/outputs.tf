#Example
# output "instance_ip_addr" {
#   value = aws_instance.server.private_ip
# }
output "secuirty_group_id" {
  value = aws_security_group.public_sg.id
}

output "public_subnet" {
  value = aws_subnet.public_subnet
}