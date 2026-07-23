# Deployment Guide

## AWS-friendly deployment plan

### Frontend
- Build the React app with Vite.
- Deploy the static output to S3 + CloudFront or Vercel.
- Configure VITE_API_URL to point to the backend URL.

### Backend
- Deploy the Node/Express server to EC2, Elastic Beanstalk, or App Runner.
- Set the following environment variables:
  - PORT
  - CORS_ORIGIN
  - DATA_FILE_PATH
- Ensure the server can write to the chosen data directory.

### Suggested environment variables

Backend:
```env
PORT=4000
CORS_ORIGIN=https://your-frontend-domain.com
DATA_FILE_PATH=/var/app/data/app-data.json
```

Frontend:
```env
VITE_API_URL=https://your-backend-domain.com
```
