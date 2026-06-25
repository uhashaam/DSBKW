const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DATA_PATH = path.join(__dirname, 'data.json');
const SETTINGS_PATH = path.join(__dirname, '..', 'next-app', 'src', 'lib', 'settings.json');

console.log('Admin API Server paths configured:');
console.log('  Data file:', DATA_PATH);
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

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // --- SETTINGS ENDPOINTS ---
    if (pathname === '/api/settings') {
      if (req.method === 'GET') {
        if (!fs.existsSync(SETTINGS_PATH)) {
          return sendJSON(res, 404, { error: 'Settings file not found' });
        }
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

    // --- POSTS ENDPOINTS ---
    if (pathname === '/api/posts') {
      if (req.method === 'GET') {
        if (!fs.existsSync(DATA_PATH)) {
          return sendJSON(res, 200, []);
        }
        const data = fs.readFileSync(DATA_PATH, 'utf8');
        return sendJSON(res, 200, JSON.parse(data));
      }

      if (req.method === 'POST') {
        const updatedPost = await parseJSONBody(req);
        if (!updatedPost.slug) {
          return sendJSON(res, 400, { error: 'Post slug is required' });
        }

        let posts = [];
        if (fs.existsSync(DATA_PATH)) {
          posts = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
        }

        // Check if updating an existing post
        const index = posts.findIndex(p => p.slug === updatedPost.slug || (updatedPost.oldSlug && p.slug === updatedPost.oldSlug));
        
        // Remove oldSlug property before saving
        const postToSave = { ...updatedPost };
        delete postToSave.oldSlug;

        if (index > -1) {
          posts[index] = postToSave;
          console.log(`Updated post: ${postToSave.title} (${postToSave.slug})`);
        } else {
          posts.unshift(postToSave);
          console.log(`Created new post: ${postToSave.title} (${postToSave.slug})`);
        }

        fs.writeFileSync(DATA_PATH, JSON.stringify(posts, null, 2), 'utf8');
        return sendJSON(res, 200, { success: true, post: postToSave });
      }

      if (req.method === 'DELETE') {
        const slug = url.searchParams.get('slug');
        if (!slug) {
          return sendJSON(res, 400, { error: 'Slug parameter is required' });
        }

        if (!fs.existsSync(DATA_PATH)) {
          return sendJSON(res, 404, { error: 'No posts found to delete' });
        }

        let posts = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
        const initialLength = posts.length;
        posts = posts.filter(p => p.slug !== slug);

        if (posts.length === initialLength) {
          return sendJSON(res, 404, { error: `Post with slug "${slug}" not found` });
        }

        fs.writeFileSync(DATA_PATH, JSON.stringify(posts, null, 2), 'utf8');
        console.log(`Deleted post with slug: ${slug}`);
        return sendJSON(res, 200, { success: true, message: `Post "${slug}" deleted successfully` });
      }
    }

    // --- CATCH ALL ---
    return sendJSON(res, 404, { error: 'Not Found' });

  } catch (error) {
    console.error('Admin API Server Error:', error);
    return sendJSON(res, 500, { error: error.message || 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`Admin API Server is running locally on http://localhost:${PORT}`);
});
