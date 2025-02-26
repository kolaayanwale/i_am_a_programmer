#!/bin/zsh
# Ensure the function is given an argument to name a directory
if [ -z "$1" ]; then
    echo "Usage: tdd_env <project-name>"
    return 1
fi
PROJECT_NAME=$1
#shell does not like spaces between =
mkdir $PROJECT_NAME
cd $PROJECT_NAME
mkdir src
touch src/$PROJECT_NAME.py
mkdir tests
touch tests/__init__.py
echo "import unittest
# file name must begin with test_
# class must begin with Test as does a function need to begin with test_

class Test$PROJECT_NAME(unittest.TestCase):

    def test_failure(self):
        self.assertFalse(True)

# Exceptions Encountered
# AssertionError

" > tests/test_$PROJECT_NAME.py
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
echo "pytest-watch" > requirements.txt
python3 -m pip install -r requirements.txt
pytest-watch