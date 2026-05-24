// backend/generate-portal-hashes.js
/**
 * Run this to generate localized bcrypt hashes for both Admins and Students.
 * Usage: node generate-portal-hashes.js
 */
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL    = 'admin@examportal.com';
const ADMIN_PASSWORD = 'Admin@1234';
const STUDENT_PASSWORD = 'Test@1234';

async function generateHashes() {
  console.log("-----------------------------------------------------------------");
  console.log("⚡ GENERATING ENVIRONMENT-SPECIFIC CRYPTO HASHES ⚡");
  console.log("-----------------------------------------------------------------");

  try {
    // 1. Generate Admin Hash & Verify
    const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const isAdminMatch = await bcrypt.compare(ADMIN_PASSWORD, adminHash);
    
    // 2. Generate Student Hash & Verify
    const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 10);
    const isStudentMatch = await bcrypt.compare(STUDENT_PASSWORD, studentHash);

    console.log(`\n🔑 Runtimes Verified: Admin Match (${isAdminMatch}) | Student Match (${isStudentMatch})\n`);
    
    console.log("📋 STEP 1: RUN THIS IN MYSQL WORKBENCH TO FIX THE ADMIN ACCOUNT:");
    console.log("=================================================================");
    console.log(`USE online_exam_db;`);
    console.log(`UPDATE admin SET password_hash = '${adminHash}' WHERE email = '${ADMIN_EMAIL}';`);
    console.log("\n*Or if starting completely fresh:*");
    console.log(`INSERT INTO admin (full_name, email, password_hash) VALUES ('System Admin', '${ADMIN_EMAIL}', '${adminHash}');`);
    
    console.log("\n-----------------------------------------------------------------");
    
    console.log("\n📋 STEP 2: RUN THIS IN MYSQL WORKBENCH TO FIX ALL STUDENT ACCOUNTS:");
    console.log("=================================================================");
    console.log(`USE online_exam_db;`);
    console.log(`UPDATE students SET password_hash = '${studentHash}';`);
    console.log("\n*Or if you want to apply it precisely within seed.sql syntax:*");
    console.log(`('${studentHash}')`);
    console.log("\n-----------------------------------------------------------------");

  } catch (error) {
    console.error("❌ Generation error:", error.message);
  }
}

generateHashes();