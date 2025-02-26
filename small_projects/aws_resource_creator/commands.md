## From scratch - to make it repeatable
### Create file structure
```
mkdir -p aws_resource_creator/src aws_resource_creator/tests
touch src/main.py tests/__init__.py tests/test_main.py #init.py tells python that this folder is a package

```
### test_magic.py
run the test
```
python3 -m unittest
```
### pytest watch to automatically run test when code changes happen
create a virtual environment
```
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
echo pytest-watch > requirements.txt
python3 -m pip install --requirement requirements.txt
pytest-watch #ctrl+c to exit test
```

### Notes
TDD Cycle -
RED: make it fail
GREEN: make it pass
REFACTOR: make it better. DRY