import React from 'react';
import Navigation from './Navigation.jsx';
import { Outlet } from 'react-router';

function Layout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-grow">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;