import { MailService } from '@sendgrid/mail';
import { debugSendGridConfig, getSendGridErrorInfo } from './emailDebug';

// Debug SendGrid configuration on startup
debugSendGridConfig();

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set. Email functionality will be disabled.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("Email sending skipped - no API key configured");
    return false;
  }

  try {
    const emailData = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    };
    
    console.log(`Sending email to ${params.to} with subject: ${params.subject}`);
    const response = await mailService.send(emailData);
    console.log(`Email sent successfully to ${params.to}. SendGrid response:`, response[0].statusCode);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', getSendGridErrorInfo(error));
    console.error('Full error details:', error);
    return false;
  }
}

export async function sendPrayerReminder(
  recipientEmail: string, 
  subjectName: string, 
  prayerMessage: string,
  subjectGender: 'male' | 'female' = 'male'
): Promise<boolean> {
  // Use authenticated domain email - must match verified sender identity
  const emailContent = {
    to: recipientEmail,
    from: {
      email: 'reminder@tadhkir.org',
      name: 'Tadhkir'
    },
    subject: `Prayer reminder: ${subjectName}`,
    replyTo: 'noreply@tadhkir.org',
    categories: ['prayer-reminder'],
    customArgs: {
      type: 'prayer_reminder',
      subject_name: subjectName
    },
    text: `
Peace be upon you,

This is your prayer reminder for ${subjectName}.

${prayerMessage}

May Allah grant them peace and mercy.

Tadhkir - Prayer reminder service
Manage your subscriptions: https://tadhkir.replit.app/unsubscribe?email=${encodeURIComponent(recipientEmail)}

If the above link doesn't work, please contact support.
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    .container { background: #ffffff; border: 1px solid #e1e5e9; border-radius: 6px; padding: 24px; }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }
    .prayer-text { background: #f6f8fa; padding: 16px; border-radius: 6px; margin: 16px 0; text-align: center; border: 1px solid #d1d9e0; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e1e5e9; font-size: 12px; color: #656d76; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Tadhkir</div>
      <h2>Prayer Reminder</h2>
      <p>Peace be upon you</p>
    </div>
    
    <p>This is your prayer reminder for <strong>${subjectName}</strong>.</p>
    
    <div class="prayer-text">
      <p><em>${prayerMessage}</em></p>
    </div>
    
    <p>May Allah grant them peace and mercy.</p>
    
    <div class="footer">
      <p>Tadhkir - Prayer reminder service<br>
      <a href="https://tadhkir.replit.app/unsubscribe?email=${encodeURIComponent(recipientEmail)}" style="color: #3498db; text-decoration: none;">Manage your subscriptions</a>
      <br><small style="color: #666;">If you need help, please contact support</small></p>
    </div>
  </div>
</body>
</html>
    `.trim()
  };

  // Convert to proper format for sendEmail function
  const emailParams: EmailParams = {
    to: emailContent.to,
    from: emailContent.from.email,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html
  };

  return await sendEmail(emailParams);
}