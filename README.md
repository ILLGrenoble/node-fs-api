# Node FS API
[![npm version](https://badge.fury.io/js/%40illgrenoble%2Fnode-fs-api.svg)](https://badge.fury.io/js/%40illgrenoble%2Fnode-fs-api)

`Node FS API` is a REST API built with Express to provide access to the file system. File system access is limited to the user running the application (system files are inaccessible). It is provided as a backend to the Angular component [`ngx-fs-client`](https://www.npmjs.com/package/@illgrenoble/ngx-fs-client) to enable a simple remote file manager.

Due to security concerns the client is not intended to access the server directly but rather use a server-side proxy to manage access/authorisation rights (eg running the FS API within a micro-service architecture).

As a simple security measure (inefficient for direct public access), the server can be configured to only accept requests with a valid `x-auth-token` header. In practive the `Node FS API` should be accessed via a gateway or proxy that enables full authentication/authorisation. The client should access the server via the proxy which verifies that the authenticated user can access the server, and adds accordingly the `x-auth-token` (the client should never be aware of the token, not should the token be accessible/visible publicly).

## Features

- Obtain file contents (encoded as base64 if the file is binary)
- Create new files from posted data
- Create empty files and folders
- Move/rename files and folder
- Copy files
- Delete files and folders

# Building and running

The server can be built and run from source as follows:

```
npm install
npm start
```

You can also run it directly from the npm pacakge:

```
npm i -g @illgrenoble/node-fs-api
node-fs-api
```

# Configuration

The following environment variables can be set to configure the API:

|Environment variable|default value|description|
|---|---|---|
|NODE_FS_API_SERVER_HOST|localhost|Host on which the Express server listens to|
|NODE_FS_API_SERVER_PORT|8090|The Express server port|
|NODE_FS_API_SERVER_AUTH_TOKEN| |An authorisation token that (when set) must be added to the request header `x-auth-token`|
|NODE_FS_API_MAX_FILE_UPLOAD_SIZE|2.0mb|Max payload size that is accepted by the Express server|
|NODE_FS_API_LOG_LEVEL|debug|Logging level|
|NODE_FS_API_LOG_TIMEZONE| |Timezone for the logs|

The environment variables can be stored in a `.env` file.
