import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Service pour générer les templates d'emails avec la charte DigiLum
 */
@Injectable()
export class EmailTemplatesService {
  private readonly frontendUrl: string;
  private readonly logoUrl: string;

  // Couleurs de la marque DigiLum
  private readonly colors = {
    primaryBlue: '#1A1A1A',
    accentOrange: '#F5A623',
    accentOrangeLight: '#E08C00',
    textDark: '#1A1A1A',
    textLight: '#444444',
    background: '#FFFFFF',
    border: '#E0E0E0',
    success: '#28A745',
    error: '#DC3545',
    warning: '#FFC107',
  };

  constructor(private configService: ConfigService) {
    this.frontendUrl = this.configService.get<string>('APP_FRONTEND_URL') || 'http://localhost:5173';
    // Logo en base64 ou URL publique - pour l'instant on utilisera une URL publique
    // Si le logo est hébergé sur Cloudinary, utiliser cette URL
    this.logoUrl = "https://via.placeholder.com/240x80.png?text=DigiLum"
  }

  /**
   * Template de base avec header/footer et logo
   */
  private getBaseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DigiLum</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${this.colors.background}; line-height: 1.6; color: ${this.colors.textDark};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${this.colors.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header avec logo -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, ${this.colors.primaryBlue} 0%, ${this.colors.primaryBlue} 50%, ${this.colors.accentOrange} 50%, ${this.colors.accentOrange} 100%); border-radius: 8px 8px 0 0;">
              <img src="${this.logoUrl}" alt="Digilum" style="max-width: 200px; height: auto; display: block; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; padding: 12px;" />
            </td>
          </tr>
          
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: ${this.colors.background}; border-top: 1px solid ${this.colors.border}; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: ${this.colors.textLight};">
              <p style="margin: 0 0 10px;">
                <strong style="color: ${this.colors.primaryBlue};">DigiLum</strong>
              </p>
              <p style="margin: 0 0 10px;">
                Votre partenaire digital
              </p>
              <p style="margin: 0;">
                <a href="${this.frontendUrl}" style="color: ${this.colors.accentOrange}; text-decoration: none;">${this.frontendUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }


  /**
   * Template : Réinitialisation mot de passe
   */
  passwordReset(fullName: string, resetUrl: string): string {
    const content = `
      <h1 style="color: ${this.colors.primaryBlue}; margin: 0 0 20px; font-size: 24px; font-weight: 600;">
        Réinitialisation de mot de passe
      </h1>
      
      <p style="margin: 0 0 15px; color: ${this.colors.textDark};">
        Bonjour ${fullName},
      </p>
      
      <p style="margin: 0 0 20px; color: ${this.colors.textDark};">
        Nous avons reçu une demande de réinitialisation de votre mot de passe. Si vous êtes à l’origine de cette demande, cliquez ci-dessous.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: ${this.colors.accentOrange}; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Réinitialiser mon mot de passe
        </a>
      </div>
      
      <p style="margin: 0 0 10px; color: ${this.colors.textLight}; font-size: 14px;">
        Si le bouton ne fonctionne pas, copiez-collez ce lien :
      </p>
      <p style="margin: 0 0 20px; word-break: break-all; color: ${this.colors.textLight}; font-size: 13px;">
        ${resetUrl}
      </p>
      
      <div style="background-color: #FFF8E1; padding: 16px; border-radius: 6px; border-left: 4px solid ${this.colors.warning}; margin: 20px 0;">
        <p style="margin: 0; color: ${this.colors.textDark}; font-size: 14px;">
          Si vous n’avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
        </p>
      </div>
      
      <p style="margin: 0; color: ${this.colors.textLight}; font-size: 14px;">
        Ce lien expire dans 2 heures.
      </p>
    `;

    return this.getBaseTemplate(content);
  }

  /**
   * Template : Mot de passe temporaire (création admin)
   */
  temporaryPassword(
    fullName: string,
    email: string,
    temporaryPassword: string,
    loginUrl: string,
  ): string {
    const content = `
      <h1 style="color: ${this.colors.primaryBlue}; margin: 0 0 20px; font-size: 24px; font-weight: 600;">
        Accès administrateur
      </h1>
      
      <p style="margin: 0 0 15px; color: ${this.colors.textDark};">
        Bonjour ${fullName},
      </p>
      
      <p style="margin: 0 0 20px; color: ${this.colors.textDark};">
        Votre compte administrateur a été créé. Voici vos identifiants temporaires :
      </p>
      
      <div style="background-color: ${this.colors.background}; padding: 18px; border-radius: 6px; border: 1px solid ${this.colors.border}; margin: 20px 0;">
        <p style="margin: 0 0 8px; color: ${this.colors.textDark};">
          <strong>Email :</strong> ${email}
        </p>
        <p style="margin: 0; color: ${this.colors.textDark};">
          <strong>Mot de passe temporaire :</strong>
          <span style="display:inline-block; padding: 6px 10px; border-radius: 4px; background:#FFFFFF; border:1px solid ${this.colors.border}; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
            ${temporaryPassword}
          </span>
        </p>
      </div>
      
      <div style="background-color: #FFEBEE; padding: 16px; border-radius: 6px; border-left: 4px solid ${this.colors.error}; margin: 20px 0;">
        <p style="margin: 0; color: ${this.colors.textDark}; font-size: 14px;">
          <strong>Important :</strong> connectez-vous et changez ce mot de passe immédiatement.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="display: inline-block; padding: 14px 28px; background-color: ${this.colors.primaryBlue}; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Se connecter
        </a>
      </div>
    `;

    return this.getBaseTemplate(content);
  }


}
