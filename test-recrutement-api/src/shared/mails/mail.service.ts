import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EmailTemplatesService } from './templates/email-templates.service';

interface EmailOptions {
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: { email: string; name?: string };
  cc?: Array<{ email: string; name?: string }>;
  bcc?: Array<{ email: string; name?: string }>;
}

/**
 * Service pour envoyer des emails via Brevo (Sendinblue)
 * API: https://developers.brevo.com/docs/send-transactional-email
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly brevoApiKey: string | undefined;
  private readonly senderEmail: string | undefined;
  private readonly senderName: string | undefined;
  private readonly apiUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor(
    private configService: ConfigService,
    private emailTemplatesService: EmailTemplatesService,
  ) {
    this.brevoApiKey = this.configService.get<string>('BREVO_API_KEY');
    this.senderEmail = this.configService.get<string>('BREVO_SENDER_EMAIL');
    this.senderName = this.configService.get<string>('BREVO_SENDER_NAME');

    if (!this.brevoApiKey) {
      this.logger.warn(
        'BREVO_API_KEY non configuré. Les emails ne seront pas envoyés.',
      );
    }
  }

  /**
   * Envoyer un mail de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(
    email: string,
    fullName: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get('APP_FRONTEND_URL')}/new-password?token=${resetToken}`;
    const htmlContent = this.emailTemplatesService.passwordReset(fullName, resetUrl);

    await this.send({
      to: [{ email, name: fullName }],
      subject: 'Réinitialisation de votre mot de passe - Compétences Plus',
      htmlContent,
    });
  }

  /**
   * Envoyer un email avec mot de passe temporaire (pour création admin)
   */
  async sendTemporaryPassword(
    email: string,
    fullName: string,
    temporaryPassword: string,
  ): Promise<void> {
    const loginUrl = `${this.configService.get('APP_FRONTEND_URL')}/sign-in`;
    const htmlContent = this.emailTemplatesService.temporaryPassword(fullName, email, temporaryPassword, loginUrl);

    await this.send({
      to: [{ email, name: fullName }],
      subject: 'Vos identifiants administrateur - Compétences Plus',
      htmlContent,
    });
  }

  /**
   * Méthode privée pour envoyer un email via Brevo
   */
  private async send(options: EmailOptions): Promise<void> {
    if (!this.brevoApiKey) {
      this.logger.warn(
        `Email non envoyé (BREVO_API_KEY manquant). À: ${options.to[0].email}`,
      );
      return;
    }

    try {
      const payload = {
        sender: {
          name: this.senderName,
          email: this.senderEmail,
        },
        ...options,
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'api-key': this.brevoApiKey,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(
        `Email envoyé avec succès à ${options.to[0].email}. Message ID: ${response.data.messageId}`,
      );
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email:`, error);
      throw new HttpException(
        'Erreur lors de l\'envoi de l\'email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Public wrapper to send arbitrary emails using the same internal send implementation
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    return this.send(options);
  }
}
