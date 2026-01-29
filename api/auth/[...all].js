import { auth } from '../../../src/lib/auth.js';

export default async function handler(req, res) {
  // Handle better-auth requests
  // The auth handler expects the full request and response objects
  // and will handle all auth-related operations
  
  // Pass all requests to better-auth handler
  return auth.handler(req, res);
}
