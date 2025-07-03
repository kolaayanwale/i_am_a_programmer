resource "aws_key_pair" "example" {
  key_name   = "example-key"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDNKUD0+kpJiTgsWUbfzuAbkJDDSufqTndu7D+TQ+nlnhonsU0IgxI7Q3uLuyx3srSReyV5Ri5OmE6MLGNpnsKg5rWHRktD+ZV4f2IkyStPwgb4D0sXyhgy7D6P4LMMUtZu3xc4BPcZmX5FoDZeXgQ2nzZ8PY7uxQYeW6uEi3AeTtR3EaVNaQ90RlbEse+j1Fq/om98StgkqY+GMoz69fNRyZ1wzZuXvktNRhaxvI463pMA9TNya0HvdOEjwJWZl6BAkEQakBx4hJf6K/Izv3CW3/8KwplIQcakvXIRIpRwdt6mF/rS6fC522giiX0P0d3WL82JW6gbXeqRut7dIqt7ntnapVgd3XyYuUPxoiYcya1V29niO/DaRbnmDW+Q7LfHF8uudKqYMtbH3+9lLLqom1S4dH37J1yZEu8wFAh1lybV5ysKLI+bBSXS2aU3Nq7LutfhI+O8xV2ICDr4AZZaulgc0iU1639hCv6hSfEEb/HyQ/x65WjTVvbtlthVdsH321NB9pkJ/yLdYQxWeIPTt1lVfZzUPLk47mlColLYBgmnDz4p2XhsxZHiDKgdgNROZzQnkx0L8d3jVnFND2Oqpk7ixwUdEWdWVonIk7fba69c/xgtiBYklJATEX8A0KHVLdNk3bsMH9y+l+m2e9HwTAAY3uVtAGTNhzED4ePaGw== kola@Kolawoles-MBP.attlocal.net"
}

# ssh-keygen -t rsa -b 4096 -f my_key -C "your_email@example.com"
# •	-t rsa: Specifies the RSA algorithm.
# •	-b 4096: Uses 4096-bit encryption for stronger security.
# •	-f my_key: Saves the key as my_key (creates my_key and my_key.pub).
# •	-C "your_email@example.com": Adds a comment.
# copy and paste public key into the terraform key_pair resource