

export const createEmailTemplate = (message: string, clientName: string, companySettings?: any): string => {
  const logoSection = companySettings?.logo_base64 ? 
    `<img src="${companySettings.logo_base64}" alt="${companySettings.company_name || 'What the Heck'}" style="max-height: 60px; width: auto; margin-bottom: 15px;">` :
    `<div class="logo">${companySettings?.company_name || 'What the Heck'}</div>`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice Email</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .email-container {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e9ecef;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .message-content {
          white-space: pre-line;
          margin: 20px 0;
          padding: 20px;
          background-color: #f8f9fa;
          border-left: 4px solid #007bff;
          border-radius: 4px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          text-align: center;
          font-size: 14px;
          color: #6c757d;
        }
        .attachment-note {
          background-color: #e7f3ff;
          border: 1px solid #b3d9ff;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          ${logoSection}
        </div>
        
        <div class="message-content">
          ${message.replace(/\n/g, '<br>')}
        </div>
        
        <div class="attachment-note">
          📎 Your invoice is attached as a PDF to this email.
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p><strong>${companySettings?.company_name || 'What the Heck'}</strong><br>
          ${companySettings?.address_line1 || '8 King Street'}<br>
          ${companySettings?.address_line2 || 'Te Puke 3119'}<br>
          ${companySettings?.address_line3 || 'NEW ZEALAND'}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

