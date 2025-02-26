# Shell scripting
* Create a new script invscode
```
code my_script.sh
```

* add a shebang at the top to specify the interpreter (zsh/bash)
```
#!/bin/zsh
```

* Make the file executable
```
chmod +x my_script.sh
```

* To run the script
```
./my_script.sh
```

* Variable in shell
```
NAME="Alice"   # No spaces around =
echo "Hello, $NAME"  # Use $ to access variables
```

* Conditional Statements (if/else)
```
#!/bin/zsh

VAR=10

if [ "$VAR" -gt 5 ]; then
    echo "VAR is greater than 5"
elif ["$VAR" -eq 5 ]; then
    echo "VAR is equal to 5"
else
    echo "VAR is less than 5"
fi
```
- -gt means greater than
- -eq means equal

* Common Conditional Operators
| Shell        | Meaning                 | Python Equivalent    |
| ------------ | ----------------------- | -------------------- |
| -z "VAR"     | String is empty         | not var              |
| -n "VAR"     | String is not empty     | bool(var)            |
| "$A" == "$B" | Strings are equal       | a == b               |
| "$A" != "$B" | Variables are not equal | a!= b                |
| -e file      | file exists             | os.path.exists(file) |
| -f file      | Regular file exists     | os.path.isfile(file) |
| -d dir       | Directory exists        | os.path.isdir(dir)   |

* for Loops
```
#!/bin/zsh

for i in {1..5}; do
    echo "iteration $i"
done
```

* while Loops
```
#!/bin/zsh

COUNT=1

while [ $COUNT -le 5 ]; do
    echo "Count is $COUNT"
    ((COUNT++))
done
```

* Functions
```
my_function() {
    echo "Hello from function"
}

my_function()
```

* Script Arguments
```
#!/bin/zsh
echo "First argument: $1"
echo "Second argument: $2"
```

* Reading user input
```
#!/bin/bash
echo "Enter your name:"
read NAME
echo "Hello, $NAME!"
```

* Exit codes & Error handling
```
#!/bin/bash
command_that_might_fail || echo "Command failed!"  # Runs only if the command fails

command_that_might_fail && echo "Command succeeded!"  # Runs only if the command succeeds
```
- Shell uses && for success, || for failure, and $? to check the exit code.
