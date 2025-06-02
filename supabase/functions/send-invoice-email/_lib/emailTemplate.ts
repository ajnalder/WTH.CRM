
export const createEmailHTML = (
  message: string,
  invoiceNumber: string,
  invoice: any
): string => {
  const invoiceDetails = invoice.description ? 
    `<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h4 style="margin: 0 0 10px 0; color: #333;">Invoice Details:</h4>
      <p style="margin: 0; color: #666;">${invoice.description}</p>
     </div>` : '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0 0 10px 0;">Invoice from What the Heck</h2>
        <p style="color: #666; margin: 0;">Invoice #${invoiceNumber}</p>
      </div>
      
      ${invoiceDetails}
      
      <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
        ${message.split('\n').map(line => `<p style="margin: 10px 0; color: #333;">${line}</p>`).join('')}
      </div>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #333;">Payment Details:</h4>
        <p style="margin: 5px 0; color: #666;"><strong>Due Date:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Upon receipt'}</p>
        <p style="margin: 5px 0; color: #666;"><strong>Direct Credit:</strong> Mackay Distribution 2018 Limited</p>
        <p style="margin: 5px 0; color: #666;"><strong>Account:</strong> 06-0556-0955531-00</p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center; color: #666; font-size: 12px;">
        <p>This email was sent from What the Heck invoice system.</p>
      </div>
    </div>
  `;
};
