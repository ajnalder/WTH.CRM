

export const createEmailTemplate = (message: string, clientName: string, companySettings?: any): string => {
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
          padding: 40px 20px;
          background-color: #ffffff;
        }
        .message-content {
          white-space: pre-line;
          margin: 0 0 30px 0;
        }
        .attachment-note {
          color: #666;
          font-size: 14px;
          margin: 30px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
      
      <div class="attachment-note">
        Your invoice is attached as a PDF.
      </div>
      
      <div class="footer">
        <strong>${companySettings?.company_name || 'What the Heck'}</strong><br>
        ${companySettings?.address_line1 || '8 King Street'}<br>
        ${companySettings?.address_line2 || 'Te Puke 3119'}<br>
        ${companySettings?.address_line3 || 'NEW ZEALAND'}
      </div>
    </body>
    </html>
  `;
};
