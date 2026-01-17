#!/usr/bin/env node

/**
 * Generate a secure random JWT secret key
 * Usage: node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('base64');

console.log('\nYour new JWT secret:');
console.log('\x1b[32m%s\x1b[0m', secret);
console.log('\nAdd this to your .env file:');
console.log('\x1b[33m%s\x1b[0m', `JWT_SECRET=${secret}`);
