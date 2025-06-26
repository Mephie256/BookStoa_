// Vercel API function for Cloudinary uploads
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    const file = files.file?.[0];
    const type = fields.type?.[0] || 'auto';

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Determine upload options based on type
    let uploadOptions = {
      folder: 'pneuma-bookstore',
      resource_type: 'auto',
    };

    if (type === 'cover') {
      uploadOptions = {
        ...uploadOptions,
        folder: 'pneuma-bookstore/covers',
        resource_type: 'image',
        transformation: [
          { width: 600, height: 800, crop: 'fill', quality: 'auto' },
          { format: 'auto' }
        ]
      };
    } else if (type === 'pdf') {
      uploadOptions = {
        ...uploadOptions,
        folder: 'pneuma-bookstore/books',
        resource_type: 'raw',
      };
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.filepath, uploadOptions);

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      resourceType: result.resource_type,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Upload failed',
      details: error.message 
    });
  }
}
