// Example backend API for Cloudflare R2 file uploads
// This would be deployed as a serverless function or API endpoint

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure R2 client (R2 is S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

// Generate signed upload URL
export async function generateUploadUrl(req, res) {
  try {
    const { fileName, fileType, folder = '' } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType are required' });
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = folder ? `${folder}/${timestamp}-${sanitizedFileName}` : `${timestamp}-${sanitizedFileName}`;

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      // Optional: Add metadata
      Metadata: {
        'uploaded-by': 'pneuma-bookstore',
        'upload-timestamp': timestamp.toString()
      }
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 }); // 1 hour

    res.json({
      uploadUrl,
      key,
      publicUrl: `${PUBLIC_URL}/${key}`
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}

// Delete file from R2
export async function deleteFile(req, res) {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'fileId is required' });
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileId,
    });

    await r2Client.send(command);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
}

// Express.js route handlers
export function setupR2Routes(app) {
  app.post('/api/r2/upload-url', generateUploadUrl);
  app.delete('/api/r2/delete', deleteFile);
}

// Vercel serverless function example
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST' && req.url === '/api/r2/upload-url') {
    return generateUploadUrl(req, res);
  }

  if (req.method === 'DELETE' && req.url === '/api/r2/delete') {
    return deleteFile(req, res);
  }

  res.status(404).json({ error: 'Not found' });
}

// Netlify function example
export const netlifyHandler = async (event, context) => {
  const req = {
    method: event.httpMethod,
    url: event.path,
    body: event.body ? JSON.parse(event.body) : {}
  };

  const res = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    },
    body: '',
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.body = JSON.stringify(data);
      return this;
    },
    setHeader: function(name, value) {
      this.headers[name] = value;
    }
  };

  await handler(req, res);

  return {
    statusCode: res.statusCode,
    headers: res.headers,
    body: res.body
  };
};

// Environment variables needed:
/*
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=pneuma-bookstore
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.your-account.r2.cloudflarestorage.com
*/

// Package.json dependencies needed:
/*
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.x.x",
    "@aws-sdk/s3-request-presigner": "^3.x.x"
  }
}
*/
