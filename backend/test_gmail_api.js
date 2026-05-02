/**
 * Quick smoke-test for Gmail API email delivery via OAuth2.
 * Run:  node test_gmail_api.js [recipient_email]
 */
require('dotenv').config();
const { google } = require('googleapis');

const FROM_EMAIL = process.env.EMAIL_USER || 'ekyampro@gmail.com';
const TO_EMAIL = process.argv[2] || FROM_EMAIL;

// Validate env
const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
for (const key of required) {
    if (!process.env[key]) {
        console.error(`❌ ${key} is not set in .env`);
        process.exit(1);
    }
}

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

console.log(`📧 Sending test email via Gmail API...`);
console.log(`   From: EKYAM <${FROM_EMAIL}>`);
console.log(`   To:   ${TO_EMAIL}`);

(async () => {
    try {
        const rawMessage = [
            `From: EKYAM <${FROM_EMAIL}>`,
            `To: ${TO_EMAIL}`,
            `Subject: ✅ EKYAM – Gmail API Test`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            `<div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 2rem; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="color: #4338ca;">EKYAM – Gmail API Test</h2>
                <p>If you're reading this, Gmail API email delivery is working correctly! 🎉</p>
                <p style="color: #9ca3af; font-size: 0.85rem;">Sent at: ${new Date().toISOString()}</p>
            </div>`,
        ].join('\r\n');

        const encodedMessage = Buffer.from(rawMessage)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: encodedMessage },
        });

        console.log(`✅ Email sent successfully! messageId: ${result.data.id}`);
    } catch (err) {
        console.error('❌ Failed:', err.message);
        if (err.response) {
            console.error('   Status:', err.response.status);
            console.error('   Data:', JSON.stringify(err.response.data, null, 2));
        }
        process.exit(1);
    }
})();
