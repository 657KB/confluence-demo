# Confluence API Proxy for Vercel

This is a Confluence API proxy service based on Vercel Serverless Functions.

## Features

- Search Confluence content
- Get page details
- Support pagination and cursors
- Complete error handling

## API Endpoints

### Search API

```
GET /api/search
```

Query Parameters:

- `domain`: Confluence domain (required)
- `cql`: Confluence Query Language query statement
- `limit`: Number of results per page
- `cursor`: Pagination cursor
- `start`: Starting position

Request Headers:

- `Authorization`: Confluence API authentication token

### Get Page Content

```
GET /api/pages/[pageId]
```

Query Parameters:

- `domain`: Confluence domain (required)
- `pageId`: Page ID (path parameter)

Request Headers:

- `Authorization`: Confluence API authentication token

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file (optional):

```
# Environment variable configuration
```

3. Start development server:

```bash
npm run dev
```

## Deployment

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy to Vercel:

```bash
npm run deploy
```

## Environment Variables

- No special environment variables required, all configurations are passed through request parameters

## Notes

- Ensure valid Confluence API authentication token is provided
- Pay attention to API call limits and rate limits
- It is recommended to use environment variables to store sensitive information in production environment
