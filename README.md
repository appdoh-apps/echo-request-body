# echo-request-body

This package contains both a Svelte app web browser client displaying incoming POST requests.

It will be helpful in circumstances where request body data needs to be logged without using specialized tools.

This application contains a NodeJS server that renders the client and caches the request body data.

# Running this application

To run this application in your local machine, install `npm` and `yarn`.

In the root directory, run:

    yarn
    yarn build

Then start the NodeJS server using:

    node server.js

By default, this application starts on port 3030. Open your browser and navigate to `http://localhost:3000`. You should
be able to see the Svelte app running.
