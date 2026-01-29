import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // CRITICAL: Assign env vars to process.env so imported modules (like auth.js) can use them
  Object.assign(process.env, env);
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.png', 'vite.svg'],
        manifest: {
          name: 'Pneuma BookStore',
          short_name: 'Pneuma',
          description: 'Christian literature and audiobooks library',
          theme_color: '#11b53f',
          background_color: '#1f2937',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icon.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icon.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          categories: ['books', 'education', 'lifestyle'],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,otf}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cloudinary-images',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      }),
      {
        name: 'better-auth-middleware',
        configureServer: async (server) => {
          // Import auth handler - only in server context
          // We wrap this in a try-catch to log any startup errors
          try {
            const { auth } = await import('./src/lib/auth.js');
            
            // Add middleware to handle better-auth routes
            server.middlewares.use(async (req, res, next) => {
              if (!req.url?.startsWith('/api/auth')) {
                return next();
              }

              try {
                // Log request for debugging
                console.log(`🔐 Auth Request: ${req.method} ${req.url}`);

                const url = `http://${req.headers.host}${req.url}`;
                const headers = new Headers();
                
                Object.entries(req.headers).forEach(([key, value]) => {
                  if (value) {
                    const lowerKey = key.toLowerCase();
                    if (
                      lowerKey === 'host' ||
                      lowerKey === 'connection' ||
                      lowerKey === 'content-length'
                    ) {
                      return;
                    }
                    headers.set(key, Array.isArray(value) ? value[0] : value);
                  }
                });

                let body = undefined;
                if (req.method !== 'GET' && req.method !== 'HEAD') {
                  body = await new Promise((resolve) => {
                    let data = '';
                    req.on('data', chunk => data += chunk);
                    req.on('end', () => resolve(data));
                  });
                }

                const request = new Request(url, {
                  method: req.method,
                  headers,
                  body: body || undefined,
                });

                const response = await auth.handler(request);
                
                if (!response) {
                  console.error('❌ Auth handler returned null response');
                  res.statusCode = 500;
                  res.end('Auth handler failed');
                  return;
                }

                if (!response.ok) {
                  try {
                    const cloned = response.clone();
                    const bodyText = await cloned.text();
                    console.error(`❌ Auth response ${response.status} ${req.method} ${req.url}:`, bodyText);
                  } catch (e) {
                    console.error('❌ Failed to read auth error response:', e);
                  }
                }

                res.statusCode = response.status;
                // IMPORTANT: Do not forward Set-Cookie via Headers.forEach(), as it collapses
                // multiple Set-Cookie headers into a single comma-separated string.
                // Node expects either multiple header values or repeated headers.
                const setCookie = response.headers.getSetCookie?.();
                if (setCookie && setCookie.length > 0) {
                  res.setHeader('Set-Cookie', setCookie);
                }

                response.headers.forEach((value, key) => {
                  if (key.toLowerCase() === 'set-cookie') return;
                  res.setHeader(key, value);
                });
                
                const text = await response.text();
                res.end(text);
              } catch (error) {
                console.error('❌ Auth endpoint error:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: error?.message || 'Internal server error' }));
              }
            });
          } catch (err) {
            console.error('❌ Failed to initialize Better-Auth middleware:', err);
          }
        },
      },
    ],
    server: {
      port: 5173,
      strictPort: false,
    },
    define: {
      // Make env variables available to client-side code
      'process.env.DATABASE_URL': JSON.stringify(env.DATABASE_URL),
      'process.env.VITE_BETTER_AUTH_SECRET': JSON.stringify(env.VITE_BETTER_AUTH_SECRET),
      'process.env.VITE_BETTER_AUTH_URL': JSON.stringify(env.VITE_BETTER_AUTH_URL),
      'process.env.VITE_ADMIN_EMAIL': JSON.stringify(env.VITE_ADMIN_EMAIL),
    },
  };
});
