const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const PORT = 8080;
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

// ==========================================
// CONFIGURAÇÃO DA API DE CONVERSÕES DA META
// ==========================================
const PIXEL_ID = '1462274189332452';
// INSIRA SEU TOKEN DE ACESSO AQUI (Gerado no Gerenciador de Eventos):
const META_ACCESS_TOKEN = 'COLE_SEU_TOKEN_DE_ACESSO_AQUI'; 

// Função auxiliar para criar o hash SHA-256 (exigência da Meta)
function hashData(data) {
  if (!data) return undefined;
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

const server = http.createServer((req, res) => {
  // Rota da API de Conversões
  if (req.method === 'POST' && req.url === '/api/capi') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // Prepara os dados de correspondência (Match Data) com Hashing
        const userData = {
          client_user_agent: req.headers['user-agent'],
          client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          fbp: data.fbp,
          fbc: data.fbc
        };

        if (data.email) userData.em = [hashData(data.email)];
        if (data.phone) userData.ph = [hashData(data.phone)];

        const eventPayload = {
          data: [
            {
              event_name: data.event_name,
              event_time: Math.floor(Date.now() / 1000),
              event_id: data.event_id,
              event_source_url: data.event_source_url,
              action_source: 'website',
              user_data: userData,
              custom_data: data.custom_data || {}
            }
          ]
        };

        const postData = JSON.stringify(eventPayload);
        const options = {
          hostname: 'graph.facebook.com',
          port: 443,
          path: `/v18.0/${PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const fbReq = https.request(options, (fbRes) => {
          let fbBody = '';
          fbRes.on('data', d => { fbBody += d; });
          fbRes.on('end', () => {
            console.log('Resposta da Meta CAPI:', fbBody);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, metaResponse: JSON.parse(fbBody) }));
          });
        });

        fbReq.on('error', (e) => {
          console.error('Erro na requisição CAPI:', e);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        });

        fbReq.write(postData);
        fbReq.end();

      } catch (err) {
        console.error('Erro ao processar CAPI:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Servidor de arquivos estáticos
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  
  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
