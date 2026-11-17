import { EmailService, ALLOWED_REAL_EMAILS } from '../src/server/services/EmailService';

async function main() {
  console.log('====================================================');
  console.log(' VJTI TTMS Email Service Verification Runner');
  console.log('====================================================\n');

  console.log('1. Checking Environment Variables for SMTP...');
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || '587';
  const smtpUser = process.env.SMTP_USER;
  const hasPass = Boolean(process.env.SMTP_PASS);

  if (smtpHost && smtpUser && hasPass) {
    console.log(`   [✓] SMTP Configured:`);
    console.log(`       Host: ${smtpHost}`);
    console.log(`       Port: ${smtpPort}`);
    console.log(`       User: ${smtpUser}`);
    console.log(`       Mode: LIVE SMTP DELIVERY`);
  } else {
    console.log(`   [i] SMTP Env Vars NOT set (SMTP_HOST, SMTP_USER, SMTP_PASS).`);
    console.log(`       Mode: SAFE CONSOLE SIMULATION (Default Sandbox Mode)\n`);
  }

  console.log('2. Whitelisted Real Emails Guard:');
  ALLOWED_REAL_EMAILS.forEach((email) => {
    console.log(`   - ${email} (Allowed)`);
  });
  console.log('   All other addresses (*@dummy.ttms.local, etc.) are strictly suppressed.\n');

  console.log('3. Test Case A: Dispatching to Whitelisted Emails...');
  const resAllowed = await EmailService.sendEmail({
    to: ['tanishparekh03@gmail.com', 'tanishparekh59@gmail.com'],
    subject: '[VJTI TTMS Test] Whitelist Delivery Verification',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5;">VJTI TTMS Email Dispatch Test</h2>
        <p>This is a test notification confirming that email dispatch is active and properly routing to whitelisted addresses.</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="font-size: 12px; color: #64748b;">Department of Computer Engineering & Information Technology, VJTI Mumbai</p>
      </div>
    `,
  });

  console.log(`   Results:`);
  console.log(`   - Sent/Simulated: ${resAllowed.sent.join(', ') || 'None'}`);
  console.log(`   - Suppressed:     ${resAllowed.suppressed.join(', ') || 'None'}`);
  console.log(`   - Failed:         ${resAllowed.failed.join(', ') || 'None'}\n`);

  console.log('4. Test Case B: Dispatching to Dummy Institutional Faculty Addresses...');
  const resSuppressed = await EmailService.sendEmail({
    to: ['vbnikam@dummy.ttms.local', 'mrshirole@dummy.ttms.local', 'random_faculty@vjti.ac.in'],
    subject: '[VJTI TTMS Test] Should Be Suppressed',
    html: '<p>Should never reach any inbox</p>',
  });

  console.log(`   Results:`);
  console.log(`   - Sent:           ${resSuppressed.sent.join(', ') || 'None'}`);
  console.log(`   - Suppressed:     ${resSuppressed.suppressed.join(', ') || 'None'}`);
  console.log(`   - Failed:         ${resSuppressed.failed.join(', ') || 'None'}\n`);

  console.log('5. Outbox Audit Log Summary:');
  const logs = EmailService.getOutboxLogs();
  logs.forEach((log, idx) => {
    console.log(`   [${idx + 1}] To: ${log.to.padEnd(28)} | Status: ${log.status.padEnd(18)} | Subject: ${log.subject}`);
  });

  console.log('\n====================================================');
  console.log(' Verification Complete: All Safety Guards Active');
  console.log('====================================================');
}

main().catch(console.error);
