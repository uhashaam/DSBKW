// Admin API server for DSBKW project
// Updated to support chunked post data storage and media library

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const SETTINGS_PATH = path.join(__dirname, '..', 'public', 'settings.json');

console.log('Admin API Server paths configured:');
console.log('  Data directory:', DATA_DIR);
console.log('  Settings file:', SETTINGS_PATH);

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

// Load all posts, supporting single data.json or chunked files
function loadAllPosts() {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse data.json:', e);
      return [];
    }
  }
  if (!fs.existsSync(DATA_DIR)) return [];
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const posts = [];
  files.forEach(file => {
    const fullPath = path.join(DATA_DIR, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const arr = JSON.parse(content);
      if (Array.isArray(arr)) posts.push(...arr);
    } catch (e) {
      console.error('Error reading chunk file', file, e);
    }
  });
  return posts;
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // Settings endpoint
    if (pathname === '/api/settings') {
      if (req.method === 'GET') {
        if (!fs.existsSync(SETTINGS_PATH)) return sendJSON(res, 404, { error: 'Settings file not found' });
        const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
        return sendJSON(res, 200, JSON.parse(data));
      }
      if (req.method === 'POST') {
        const body = await parseJSONBody(req);
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(body, null, 2), 'utf8');
        console.log('Settings successfully updated');
        return sendJSON(res, 200, { success: true, message: 'Settings saved successfully' });
      }
    }

    // Posts endpoint
    if (pathname === '/api/posts') {
      if (req.method === 'GET') {
        const posts = loadAllPosts();
        return sendJSON(res, 200, posts);
      }
      if (req.method === 'POST') {
        const updatedPost = await parseJSONBody(req);
        if (!updatedPost.slug) return sendJSON(res, 400, { error: 'Post slug is required' });
        let posts = loadAllPosts();
        const index = posts.findIndex(p => p.slug === updatedPost.slug || (updatedPost.oldSlug && p.slug === updatedPost.oldSlug));
        const postToSave = { ...updatedPost };
        delete postToSave.oldSlug;
        if (index > -1) {
          posts[index] = postToSave;
          console.log(`Updated post: ${postToSave.title} (${postToSave.slug})`);
        } else {
          posts.unshift(postToSave);
          console.log(`Created new post: ${postToSave.title} (${postToSave.slug})`);
        }
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
        return sendJSON(res, 200, { success: true, post: postToSave });
      }
      if (req.method === 'DELETE') {
        const slug = url.searchParams.get('slug');
        if (!slug) return sendJSON(res, 400, { error: 'Slug parameter is required' });
        let posts = loadAllPosts();
        const initialLength = posts.length;
        posts = posts.filter(p => p.slug !== slug);
        if (posts.length === initialLength) return sendJSON(res, 404, { error: `Post with slug "${slug}" not found` });
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
        console.log(`Deleted post with slug: ${slug}`);
        return sendJSON(res, 200, { success: true, message: `Post "${slug}" deleted successfully` });
      }
    }

    // Upload endpoint - store in public/media
    if (pathname === '/api/upload' && req.method === 'POST') {
      try {
        const { filename, base64Data } = await parseJSONBody(req);
        if (!filename || !base64Data) return sendJSON(res, 400, { error: 'filename and base64Data required' });
        const buffer = Buffer.from(base64Data, 'base64');
        const uploadDir = path.join(__dirname, '..', 'public', 'media');
        fs.mkdirSync(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);
        const relativeUrl = `/media/${filename}`;
        console.log('Uploaded file:', relativeUrl);
        return sendJSON(res, 200, { success: true, url: relativeUrl });
      } catch (e) {
        console.error('Upload error:', e);
        return sendJSON(res, 500, { error: 'Upload failed' });
      }
    }

    // Media list endpoint - list from public/media and public/wp-content/uploads
    if (pathname === '/api/media' && req.method === 'GET') {
      try {
        const mediaPaths = [
          path.join(__dirname, '..', 'public', 'media'),
          path.join(__dirname, '..', 'public', 'wp-content', 'uploads')
        ];
        const walk = dir => {
          let results = [];
          if (!fs.existsSync(dir)) return results;
          const list = fs.readdirSync(dir, { withFileTypes: true });
          list.forEach(entry => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              results = results.concat(walk(fullPath));
            } else if (entry.isFile()) {
              const ext = path.extname(entry.name).toLowerCase();
              if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)) {
                // Split at 'public' to get the web path
                const parts = fullPath.split(path.join('..', 'public'));
                const relPath = parts.length > 1 ? parts[1] : fullPath.split('public')[1];
                if (relPath) {
                  results.push(relPath.replace(/\\/g, '/'));
                }
              }
            }
          });
          return results;
        };
        let allFiles = [];
        mediaPaths.forEach(p => {
          allFiles = allFiles.concat(walk(p));
        });
        return sendJSON(res, 200, { media: allFiles });
      } catch (e) {
        console.error('Media list error:', e);
        return sendJSON(res, 500, { error: 'Failed to list media' });
      }
    }

    // Not found
    return sendJSON(res, 404, { error: 'Not Found' });
  } catch (error) {
    console.error('Admin API Server Error:', error);
    return sendJSON(res, 500, { error: error.message || 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`Admin API Server is running locally on http://localhost:${PORT}`);
});
