import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './entities/auth.entity';
import {
  SignUpDto,
  SignInDto,
  ChangePasswordDto,
  ChangeEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/create-auth.dto';
import { MailService } from '../shared/mails/mail.service';
import { AuthResponse, UserResponse } from './interfaces/auth.interfaces';



@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  /**
   * Vérifier si un email est déjà utilisé
   */
  async verifyEmail(email: string): Promise<{
    exists: boolean;
    is_active: boolean;
    can_sign_up: boolean;
  }> {
    const user = await this.usersRepository.findOne({ where: { email } });

    return {
      exists: Boolean(user),
      is_active: Boolean(user?.is_active),
      can_sign_up: !user,
    };
  }

  /**
   * Créer un compte et connecter l'utilisateur directement
   */
  async signUp(signUpDto: SignUpDto): Promise<AuthResponse> {
    const { email, password, first_name, last_name } = signUpDto;

    // Vérifier que l'email n'existe pas
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = this.usersRepository.create({
      email,
      password_hash,
      first_name,
      last_name,
      is_active: true,
      email_verified_at: new Date(),
    });

    await this.usersRepository.save(user);

    // Générer tokens
    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user: this.formatUserResponse(user),
    };
  }


  /**
   * Connexion — si compte inactif, renvoie un email de confirmation
   */
  async signIn(signInDto: SignInDto): Promise<AuthResponse> {
    const { email, password } = signInDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user: this.formatUserResponse(user),
    };
  }

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-secret',
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.id },
      });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      const tokens = this.generateTokens(user);

      return {
        ...tokens,
        user: this.formatUserResponse(user),
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }

  /**
   * Retourner les infos de l'utilisateur connecté
   */
  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.formatUserResponse(user);
  }

  /**
   * Mettre à jour le profil (hors email et mot de passe)
   */
  async updateProfile(
    userId: string,
    updateData: Partial<{ first_name: string; last_name: string }>,
  ): Promise<UserResponse> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    Object.assign(user, updateData);
    await this.usersRepository.save(user);

    return this.formatUserResponse(user);
  }

  /**
   * Changer l'email
   */
  async changeEmail(
    userId: string,
    changeEmailDto: ChangeEmailDto,
  ): Promise<UserResponse> {
    const { current_password, new_email } = changeEmailDto;

    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(
      current_password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe incorrect');
    }

    // Vérifier que le nouvel email n'existe pas
    const existingUser = await this.usersRepository.findOne({
      where: { email: new_email },
    });
    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    user.email = new_email;

    await this.usersRepository.save(user);

    return this.formatUserResponse(user);
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<UserResponse> {
    const { current_password, new_password } = changePasswordDto;

    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(
      current_password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    // Hash le nouveau mot de passe
    user.password_hash = await bcrypt.hash(new_password, 10);

    await this.usersRepository.save(user);

    return this.formatUserResponse(user);
  }

  /**
   * Envoyer un lien de réinitialisation par email
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;

    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      // Ne pas révéler si l'email existe ou non
      return;
    }

    try {
      const resetToken = this.jwtService.sign(
        { id: user.id, email: user.email },
        {
          secret: this.configService.get<string>('JWT_EMAIL_SECRET') || 'default-secret',
          expiresIn: (this.configService.get<string>('JWT_EMAIL_EXPIRATION') ||
            '86400s') as any,
        },
      );
      await this.mailService.sendPasswordResetEmail(
        user.email,
        user.first_name || user.email,
        resetToken,
      );
    } catch (error) {
      this.logger.error('Erreur lors de l\'envoi de l\'email de réinitialisation', error);
    }
  }

  /**
   * Définir un nouveau mot de passe via token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<UserResponse> {
    const { token, new_password } = resetPasswordDto;

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_EMAIL_SECRET') || 'default-secret',
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.id },
      });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      user.password_hash = await bcrypt.hash(new_password, 10);
      await this.usersRepository.save(user);

      return this.formatUserResponse(user);
    } catch (error) {
      throw new BadRequestException('Token invalide ou expiré');
    }
  }

  // ============================================================================
  // Private methods
  // ============================================================================

  private generateTokens(user: User): {
    access_token: string;
    refresh_token: string;
  } {
    const payload = { id: user.id, email: user.email };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
      expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRATION') ||
        '9000s') as any,
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-secret',
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') ||
        '604800s') as any,
    });

    return { access_token, refresh_token };
  }

  private formatUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_active: user.is_active,
      email_verified_at: user.email_verified_at,
      created_at: user.created_at,
    };
  }
}
