
export interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  invoiceNumber: string;
  clientName: string;
  invoiceData: {
    invoice: any;
    client: any;
    items: any[];
  };
}
