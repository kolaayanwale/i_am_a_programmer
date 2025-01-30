#!/bin/bash

# Ensure software packages are up to date
echo "Updating software packages..."
sudo yum update -y

# Add the Jenkins repo
echo "Adding Jenkins repo..."
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo

# Import Jenkins-CI key file
echo "Importing Jenkins-CI key file..."
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# Upgrade packages
echo "Upgrading packages..."
sudo yum upgrade -y

# Install Java 17
echo "Installing Java 17..."
sudo dnf install java-17-amazon-corretto -y

# Install Jenkins
echo "Installing Jenkins..."
sudo yum install jenkins -y

# Enable Jenkins service to start at boot
echo "Enabling Jenkins service to start at boot..."
sudo systemctl enable jenkins

# Start Jenkins service
echo "Starting Jenkins service..."
sudo systemctl start jenkins

# Check the status of Jenkins service
echo "Checking Jenkins service status..."
sudo systemctl status jenkins