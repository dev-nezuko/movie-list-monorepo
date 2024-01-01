import dotenv from 'dotenv';
dotenv.config();

import app from './app';

/**
 * Starts the server, listening on the specified port from the environment variables.
 *
 * @remarks
 * 1. Configures the environment variables using dotenv.
 * 2. Retrieves the port number from the environment variables.
 * 3. Starts the Express application and listens on the specified port.
 *
 * @param {number | string} process.env.PORT - The port number on which the server will listen.
 * @returns {void}
 */
const startServer = () => {
    const port = process.env.PORT;

    app.listen(port, () => {
        console.log('Server has been started on port: ' + port);
    });
};

// Start the server
startServer();
