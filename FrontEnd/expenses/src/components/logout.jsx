import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Remove the token from localStorage
        localStorage.removeItem('token');

        // Optionally, you can also clear other user-related data
        //localStorage.removeItem('user');

        // Redirect the user to the login page
        navigate('/login');

        // Optionally, you can show a logout success message
        alert('You have been logged out successfully.');
    }, [navigate]);

    return (
        <div>
            <h2>Logging out...</h2>
            <p>Please wait while we log you out.</p>
        </div>
    );
};

export default Logout;