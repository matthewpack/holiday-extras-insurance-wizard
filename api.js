#!/usr/bin/env node

/**
 * Insurance Wizard — Server + Stub API
 *
 * Serves the wizard front-end (index.html) and handles the
 * quote API endpoint. In production the API will be replaced
 * with the real insurance search; for now it returns a stub
 * redirect URL.
 *
 * Usage:  node api.js
 *
 * Endpoints:
 *   GET  /                      -> serves the wizard (index.html)
 *   POST /api/insurance/quote   -> receives ~20 wizard variables, returns redirect URL
 */

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;

// MIME types for static file serving
const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.md':   'text/plain',
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // POST /api/insurance/quote — main API endpoint
  if (req.method === 'POST' && req.url === '/api/insurance/quote') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);

        console.log('\n' + '='.repeat(60));
        console.log(`  POST /api/insurance/quote`);
        console.log(`  ${new Date().toISOString()}`);
        console.log('='.repeat(60));

        // Log each variable clearly
        console.log('\n  Variables received:\n');
        console.log(`    agentCode:                  ${payload.agentCode}`);
        console.log(`    tripType:                   ${payload.tripType}`);
        console.log(`    partyType:                  ${payload.partyType}`);
        console.log(`    destination:                ${payload.destination}`);
        console.log(`    cruise:                     ${payload.cruise}`);
        console.log(`    winterSports:               ${payload.winterSports}`);
        console.log(`    carHireExcess:              ${payload.carHireExcess}`);
        console.log(`    cancellationCover:          ${payload.cancellationCover}`);
        console.log(`    holidayStart:               ${payload.holidayStart}`);
        console.log(`    holidayEnd:                 ${payload.holidayEnd}`);
        console.log(`    travellerCount:             ${payload.travellerCount}`);
        console.log(`    relationship:               ${payload.relationship}`);
        console.log(`    email:                      ${payload.email}`);
        console.log(`    medicalSurgeryTreatment:    ${payload.medicalSurgeryTreatment}`);
        console.log(`    medicalUndiagnosedSymptoms: ${payload.medicalUndiagnosedSymptoms}`);
        console.log(`    medicalListedConditions:    ${payload.medicalListedConditions}`);
        console.log(`    medicalRecentConditions:    ${payload.medicalRecentConditions}`);

        if (payload.travellers && payload.travellers.length > 0) {
          console.log(`\n    travellers (${payload.travellers.length}):`);
          payload.travellers.forEach((t, i) => {
            console.log(`      [${i + 1}] ${t.title} ${t.firstName} ${t.lastName}, DOB: ${t.dob}`);
          });
        }

        // Generate a random code for the redirect URL
        const code = crypto.randomBytes(8).toString('hex');
        const redirectUrl = `https://www.holidayextras.com/insurance/quote/${code}`;

        console.log(`\n  -> Returning redirect URL: ${redirectUrl}`);
        console.log('='.repeat(60) + '\n');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ redirectUrl }));

      } catch (err) {
        console.error('  Error parsing request:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal error', detail: err.message }));
      }
    });
    return;
  }

  // GET — serve static files (wizard front-end)
  if (req.method === 'GET') {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    // Strip query string
    filePath = filePath.split('?')[0];
    // Prevent directory traversal
    filePath = path.join(__dirname, path.normalize(filePath));

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log('');
  console.log('  Insurance Wizard');
  console.log(`  http://localhost:${PORT}`);
  console.log('');
  console.log('  GET  /                     ->  wizard front-end');
  console.log('  POST /api/insurance/quote  ->  receives ~20 wizard variables, returns redirect URL');
  console.log('');
  console.log('  Waiting for wizard submissions...');
  console.log('');
});
