/**
 * Run this once to generate the bcrypt hash for your admin password.
 * Usage: node generate-admin-hash.js
 * Then paste the output hash into seed_v2.sql or run the UPDATE query shown.
 */
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL    = 'admin@examportal.com';
const ADMIN_PASSWORD = 'Admin@1234';

bcrypt.hash(ADMIN_PASSWORD, 10).then(hash => {
  console.log('\n✅ Bcrypt hash generated:\n');
  console.log(hash);
  console.log('\n📋 Run this in MySQL Workbench to set/update admin password:\n');
  console.log(`UPDATE admin SET password_hash = '${hash}' WHERE email = '${ADMIN_EMAIL}';`);
  console.log('\nOr insert fresh admin:\n');
  console.log(`INSERT INTO admin (full_name, email, password_hash) VALUES ('System Admin', '${ADMIN_EMAIL}', '${hash}');`);
  console.log('');
});
