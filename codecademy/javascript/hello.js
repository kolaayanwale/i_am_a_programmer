// hello.js

// A simple JavaScript app to learn basic concepts

// Function to greet the user
function greetUser(name) {
    console.log(`Hello, ${name}! Welcome to learning JavaScript.`);
}

// Function to add two numbers
function addNumbers(a, b) {
    return a + b;
}

// Function to display today's date
function displayDate() {
    const today = new Date();
    console.log(`Today's date is: ${today.toDateString()}`);
}

// Main execution
greetUser("Kola");
console.log(`The sum of 5 and 3 is: ${addNumbers(5, 3)}`);
displayDate();