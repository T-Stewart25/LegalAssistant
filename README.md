# Legal Assistant Application

A full-stack application for legal professionals to manage client documents, chat with an AI assistant, and process legal information.

## Project Structure

- **UI**: React frontend built with Vite
- **server**: Node.js/Express backend
- **1.3**: Data processing components

## Features

- **Document Upload**: Upload and manage client documents with metadata
- **Chat Interface**: Communicate with an AI assistant
- **Client Management**: View and manage client information
- **Backend API**: RESTful API for file and chat operations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/LegalAssistant.git
   cd LegalAssistant
   ```

2. Install dependencies for both frontend and backend:
   ```
   npm run install-all
   ```

### Development

Run both the frontend and backend in development mode:

```
npm run dev
```

Or run them separately:

```
npm run dev:ui     # Run frontend only
npm run dev:server # Run backend only
```

### Building for Production

```
npm run build
```

### Deployment

The application is configured for deployment to Azure Web App service using GitHub Actions. Push to the main branch to trigger automatic deployment.

## API Endpoints

### Files API

- `GET /api/files`: Get all uploaded files
- `POST /api/files/upload`: Upload a new file
- `DELETE /api/files/:filename`: Delete a file

### Chat API

- `GET /api/chat`: Get all chat messages
- `POST /api/chat`: Send a new message
- `DELETE /api/chat/:id`: Delete a message

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
PORT=3001
NODE_ENV=development
```

## License

[MIT License](LICENSE)
