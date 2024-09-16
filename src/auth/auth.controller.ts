import { Body, Controller, Headers, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { SignUpUserDto } from './auth-dto/signup-user-dto';
import { LoginUserDto } from './auth-dto/login-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() SignUpUserDto: SignUpUserDto) {
    return this.authService.signUp(SignUpUserDto);
  }

  @Post('login')
  login(@Body() LoginUserDto: LoginUserDto) {
    return this.authService.login(LoginUserDto);
  }

  @ApiExcludeEndpoint()
  @Post('reset-token')
  async resetToken(@Headers() headers) {
    const token = headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('Token not provided', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.authService.resetToken(token);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'An error occurred while refreshing token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
