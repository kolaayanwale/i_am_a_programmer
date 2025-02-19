#!/bin/zsh
# tells computer what program to use to run the following commands

echo "Assumes already in a virtual environment, if not, run ve"
sleep 10

# Create test file and structure
echo "Creating file structure..."
mkdir tests
touch tests/__init__.py 
echo "import unittest" > tests/test.py

# Add pytest-watch to a file
echo "Adding requirements to file..."
echo pytest-watch>requirements.txt

# Install the module in the file
echo "Installing requirements..."
pip install --requirements requirements.txt

# Run pytest
echo "Running pytest..."
pytest-watch