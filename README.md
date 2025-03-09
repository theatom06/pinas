
# PiNAS

This is a simple file server made with Bun. It is intended to be used with a Raspberry Pi and a USB drive to create a simple NAS.

It also contains some bigger features like a file hash generator, time checker, and an echo server.

## Usage

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

All files are stored in drive by default.
All logs are stored in logs by default.

To run tests:

```bash
cd test
bun run test.ts
```

This project was created using `bun init` in bun v1.2.3. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Features

- **List Files**: List all files in a directory.
- **Get Metadata**: Get metadata of a file.
- **Download File**: Download a file.
- **Delete File**: Delete a file.
- **Upload File**: Upload a file.
- **Rename File**: Rename a file.
- **Health Check**: Check the health of the server.
- **Hash File**: Get the hash of a file.
- **Get Server Time**: Get the current server time.
- **Echo Message**: Echo a message.
- **Hello World**: Return a "Hello, World!" message.
- **Get Logs**: Get the server logs.
- **UUID**: Generate a UUID.
- **Paperplane**: Contains the server code for the Paperplane project.

## API Endpoints

### List Files

**GET** `/list/:id`

List all files in the specified directory.

### Get Metadata

**GET** `/metadata/:id`

Get metadata of the specified file.

### Download File

**GET** `/download/:id`

Download the specified file.

### Delete File

**DELETE** `/delete/:id`

Delete the specified file.

### Upload File

**POST** `/upload/:id`

Upload a file to the specified path.

### Rename File

**POST** `/rename/:id`

Rename the specified file.

### Health Check

**GET** `/health`

Check the health of the server.

### Hash File

**GET** `/hash/:id`

Get the hash of the specified file.

### Get Server Time

**GET** `/time`

Get the current server time.

### Echo Message

**POST** `/echo`

Echo the message sent in the request body.

### Hello World

**GET** `/helloworld`

Return a "Hello, World!" message.

### Get Logs

**GET** `/log`

Get the server logs.

### UUID

**GET** `/uuid`

Generate a UUID version 7.

### Paperplane

**POST** `/paperplane/upload`

Uploads a project to the server according to the Paperplane project and performs the necessary steps.

## License

This project is under the MIT License. See the [LICENSE](LICENSE) file for the full license text.