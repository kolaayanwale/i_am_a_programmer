import React, { useEffect, useState } from 'react';

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/')
            .then((res) => res.text()) // Change to .json() if you're expecting JSON
            .then((data) => setMessage(data.message)) // Assuming the response is { message: "some text" }
            .catch((error) => console.error("Error fetching data:", error)); // Optional error handling
    }, []);

    return (
        <div>
            <h1>{message}</h1>
        </div>
    );
}

export default App;