import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  SignUpDto,
  SignInDto,
  VerifyMailRequestDto,
  ChangePasswordDto,
  ChangeEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from './dto/create-auth.dto';
import { AuthGuard } from '../shared/guards/auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { AuthResponse, UserResponse } from './interfaces/auth.interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Vérifier si un email est déjà utilisé
   */
  @Post('verify-mail')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier disponibilité et état d un email' })
  @ApiResponse({ status: 200, description: 'Vérification effectuée' })
  async verifyEmail(@Body() dto: VerifyMailRequestDto) {
    return this.authService.verifyEmail(dto.email);
  }

  /**
   * Créer le compte et connecter l'utilisateur directement
   */
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un compte utilisateur' })
  @ApiResponse({ status: 201, description: 'Compte créé avec succès' })
  async signUp(@Body() signUpDto: SignUpDto): Promise<AuthResponse> {
    return this.authService.signUp(signUpDto);
  }

  /**
   * Connexion — si compte inactif, renvoie un email de confirmation
   */
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  async signIn(@Body() signInDto: SignInDto): Promise<AuthResponse> {
    return this.authService.signIn(signInDto);
  }

  /**
   * Rafraîchir le token d'accès
   */
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir le token d accès' })
  @ApiResponse({ status: 200, description: 'Token rafraîchi' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  /**
   * Retourner les infos de l'utilisateur connecté
   */
  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer le profil connecté' })
  @ApiResponse({ status: 200, description: 'Profil récupéré' })
  async getProfile(@CurrentUser('id') userId: string): Promise<UserResponse> {
    return this.authService.getProfile(userId);
  }

  /**
   * Mettre à jour le profil (hors email et mot de passe)
   */
  @Put('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le profil' })
  @ApiResponse({ status: 200, description: 'Profil mis à jour' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateData: Partial<{ first_name: string; last_name: string }>,
  ): Promise<UserResponse> {
    return this.authService.updateProfile(userId, updateData);
  }

  /**
   * Changer l'email
   */
  @Put('change-mail')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Changer l email du compte' })
  @ApiResponse({ status: 200, description: 'Email modifié' })
  async changeEmail(
    @CurrentUser('id') userId: string,
    @Body() changeEmailDto: ChangeEmailDto,
  ): Promise<UserResponse> {
    return this.authService.changeEmail(userId, changeEmailDto);
  }

  /**
   * Changer le mot de passe
   */
  @Put('change-password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Changer le mot de passe' })
  @ApiResponse({ status: 200, description: 'Mot de passe modifié' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<UserResponse> {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  /**
   * Envoyer un lien de réinitialisation par email
   */
  @Post('forget-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer un email de réinitialisation' })
  @ApiResponse({ status: 200, description: 'Email de réinitialisation envoyé' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * Définir un nouveau mot de passe via le token reçu par email
   */
  @Put('new-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Définir un nouveau mot de passe via token' })
  @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<UserResponse> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
