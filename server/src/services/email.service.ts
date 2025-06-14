import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { PrismaClient } from '@prisma/client';
import { BaseService } from './base.service';
import logger from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Mail.Attachment[];
  cc?: string;
  bcc?: string;
}

interface KontraktEmailData {
  kontraktId: number;
  elevNavn: string;
  elevEpost: string;
  totalBelop: number;
  terminbelop: number;
  lopetid: number;
  bedriftNavn: string;
  pdfBuffer?: Buffer;
}

class EmailService extends BaseService {
  private transporter: nodemailer.Transporter;
  private defaultFrom: string;

  constructor() {
    super();
    
    // Konfigurer e-postserver basert på miljøvariabler
    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };

    this.transporter = nodemailer.createTransport(config);
    this.defaultFrom = process.env.SMTP_FROM || 'noreply@tms.no';
  }

  // Generisk send e-post funksjon
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions: Mail.Options = {
        from: this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
        cc: options.cc,
        bcc: options.bcc
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('E-post sendt', { messageId: info.messageId, to: options.to });
      
      // Logg e-post i database
      await this.logEmail({
        to: options.to,
        subject: options.subject,
        status: 'SENT',
        messageId: info.messageId
      });
    } catch (error) {
      logger.error('Feil ved sending av e-post', { error, to: options.to });
      
      // Logg feil i database
      await this.logEmail({
        to: options.to,
        subject: options.subject,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Ukjent feil'
      });
      
      throw error;
    }
  }

  // Send kontrakt på e-post
  async sendKontraktEmail(data: KontraktEmailData): Promise<void> {
    const { kontraktId, elevNavn, elevEpost, totalBelop, terminbelop, lopetid, bedriftNavn, pdfBuffer } = data;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f3f4f6; }
          .info-box { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nedbetalingsavtale</h1>
          </div>
          
          <div class="content">
            <p>Hei ${elevNavn},</p>
            
            <p>Takk for at du har inngått nedbetalingsavtale med ${bedriftNavn}.</p>
            
            <div class="info-box">
              <h3>Detaljer om avtalen:</h3>
              <p><strong>Kontrakt ID:</strong> #${kontraktId}</p>
              <p><strong>Totalt lånebeløp:</strong> ${totalBelop.toLocaleString('nb-NO')} kr</p>
              <p><strong>Månedlig beløp:</strong> ${terminbelop.toLocaleString('nb-NO')} kr</p>
              <p><strong>Nedbetalingstid:</strong> ${lopetid} måneder</p>
            </div>
            
            <p>Vedlagt finner du den signerte nedbetalingsavtalen som PDF.</p>
            
            <p>Første termin forfaller den 1. i neste måned. Du vil motta en faktura i god tid før forfall.</p>
            
            <p>Har du spørsmål om avtalen, ta gjerne kontakt med oss.</p>
            
            <a href="${process.env.APP_URL}/kontrakter/${kontraktId}" class="button">Se kontrakt online</a>
          </div>
          
          <div class="footer">
            <p>${bedriftNavn}</p>
            <p>Dette er en automatisk generert e-post. Vennligst ikke svar direkte på denne e-posten.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments: Mail.Attachment[] = [];
    
    if (pdfBuffer) {
      attachments.push({
        filename: `kontrakt_${kontraktId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
    }

    await this.sendEmail({
      to: elevEpost,
      subject: `Nedbetalingsavtale #${kontraktId} - ${bedriftNavn}`,
      html,
      attachments
    });
  }

  // Send statusendring varsel
  async sendStatusChangeEmail(kontraktId: number, nyStatus: string, elevEpost: string, elevNavn: string): Promise<void> {
    const statusTekst: Record<string, string> = {
      'GODKJENT': 'godkjent og klar for signering',
      'SIGNERT': 'signert og aktiv',
      'AVSLUTTET': 'fullført - gratulerer!',
      'KANSELLERT': 'kansellert'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f3f4f6; }
          .status-box { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; text-align: center; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Statusoppdatering</h1>
          </div>
          
          <div class="content">
            <p>Hei ${elevNavn},</p>
            
            <p>Vi ønsker å informere deg om en statusendring på din nedbetalingsavtale.</p>
            
            <div class="status-box">
              <h2>Kontrakt #${kontraktId}</h2>
              <p>Status: <strong>${statusTekst[nyStatus] || nyStatus}</strong></p>
            </div>
            
            <p>Logg inn på din konto for mer informasjon.</p>
          </div>
          
          <div class="footer">
            <p>Dette er en automatisk generert e-post.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: elevEpost,
      subject: `Statusoppdatering - Kontrakt #${kontraktId}`,
      html
    });
  }

  // Send påminnelse om forfall
  async sendPaymentReminderEmail(kontraktId: number, elevEpost: string, elevNavn: string, terminbelop: number, forfallsDato: Date): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f3f4f6; }
          .payment-box { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border: 2px solid #f59e0b; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Betalingspåminnelse</h1>
          </div>
          
          <div class="content">
            <p>Hei ${elevNavn},</p>
            
            <p>Dette er en vennlig påminnelse om kommende betaling.</p>
            
            <div class="payment-box">
              <h3>Betalingsdetaljer:</h3>
              <p><strong>Kontrakt:</strong> #${kontraktId}</p>
              <p><strong>Beløp:</strong> ${terminbelop.toLocaleString('nb-NO')} kr</p>
              <p><strong>Forfallsdato:</strong> ${forfallsDato.toLocaleDateString('nb-NO')}</p>
            </div>
            
            <p>Vennligst sørg for at betalingen er gjennomført innen forfallsdato.</p>
            
            <p>Har du allerede betalt, kan du se bort fra denne påminnelsen.</p>
          </div>
          
          <div class="footer">
            <p>Dette er en automatisk generert påminnelse.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: elevEpost,
      subject: `Betalingspåminnelse - Forfall ${forfallsDato.toLocaleDateString('nb-NO')}`,
      html
    });
  }

  // Logg e-post aktivitet
  private async logEmail(data: {
    to: string;
    subject: string;
    status: 'SENT' | 'FAILED';
    messageId?: string;
    error?: string;
  }): Promise<void> {
    try {
      logger.info('E-post aktivitet', {
        mottaker: data.to,
        emne: data.subject,
        status: data.status,
        messageId: data.messageId,
        feil: data.error,
        tidspunkt: new Date()
      });
      
      // EmailLog tabell kan implementeres senere for detaljert sporing av e-poster
      // Database logging av e-poster utsettes til det er behov for det
    } catch (error) {
      logger.error('Feil ved logging av e-post', { error });
    }
  }

  // Test e-postkonfigurasjon
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('E-postserver tilkobling vellykket');
      return true;
    } catch (error) {
      logger.error('E-postserver tilkobling feilet', { error });
      return false;
    }
  }
}

// Eksporter singleton instans
export const emailService = new EmailService();

// Eksporter også klassen for testing
export default EmailService; 