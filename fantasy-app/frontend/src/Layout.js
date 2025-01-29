import React from 'react';
import './Layout.css'; // Import the CSS for styling

function Layout() {
    return (
        <div className="layout-container">
            {/* Header */}
            <header className="header">
                <h1>My App</h1>
            </header>

            {/* Main Content */}
            <div className="main-content">
                {/* Sidebar */}
                <aside className="sidebar">
                    <ul>
                        <li><a href="#link1">Dashboard</a></li>
                        <li><a href="#link2">Settings</a></li>
                        <li><a href="#link3">Profile</a></li>
                    </ul>
                </aside>

                {/* Content Area */}
                <main className="content">
                    <h2>Welcome to the App</h2>
                    <p>This is where your content will go.</p>
                </main>
            </div>
        </div>
    );
}

export default Layout;