import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'MotDePasseFort123!' })
  password: string;

  @ApiPropertyOptional({ example: 'Jean' })
  first_name?: string;

  @ApiPropertyOptional({ example: 'Dupont' })
  last_name?: string;
}

export class SignInDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'MotDePasseFort123!' })
  password: string;
}

export class VerifyMailRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'jwt-refresh-token' })
  refresh_token: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'AncienMotDePasse123!' })
  current_password: string;

  @ApiProperty({ example: 'NouveauMotDePasse123!' })
  new_password: string;
}

export class ChangeEmailDto {
  @ApiProperty({ example: 'MotDePasseActuel123!' })
  current_password: string;

  @ApiProperty({ example: 'new.email@example.com' })
  new_email: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'jwt-token-reset' })
  token: string;

  @ApiProperty({ example: 'NouveauMotDePasse123!' })
  new_password: string;
}

export class CreateAuthDto {}
