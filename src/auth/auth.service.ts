import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { SignUpUserDto } from './auth-dto/signup-user-dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './auth-dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private prisma: PrismaClient,
  ) {}

  generateRandomString = (length) => {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  async signUp(signUpUserDto: SignUpUserDto) {
    const { full_name, email, password } = signUpUserDto;

    try {
      const user = await this.prisma.employees.findUnique({
        where: { email: email },
      });

      if (user) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      let newData = {
        full_name,
        email,
        password: hashedPassword,
        avatar: null,
        date_of_birth: null,
        hire_date: new Date(),
        salary: null,
        job_id: null,
        department_id: null,
        manager_id: null,
        refresh_token: '',
      };

      await this.prisma.employees.create({
        data: newData,
      });

      return {
        message: 'Sign up successfully!',
        status: HttpStatus.CREATED,
        date: new Date(),
      };
    } catch (error) {
      console.log(error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'An error occurred during the sign-up process',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const user = await this.prisma.employees.findUnique({
        where: { email: email },
      });

      if (!user) {
        throw new HttpException('Email is not found!', HttpStatus.NOT_FOUND);
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw new HttpException(
          'Password is incorrect!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const key = this.generateRandomString(6);
      const payload = { employee_id: user.employee_id, key };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '30s',
        algorithm: 'HS256',
        secret: process.env.JWT_SECRET,
      });

      const refreshToken = this.jwtService.sign(
        { employee_id: user.employee_id, key },
        {
          expiresIn: '7d',
          algorithm: 'HS256',
          secret: process.env.JWT_SECRET_REFRESH,
        },
      );

      user.refresh_token = refreshToken;

      await this.prisma.employees.update({
        data: user,
        where: { employee_id: user.employee_id },
      });

      return {
        data: accessToken,
        message: 'Login successfully!',
        status: HttpStatus.OK,
        date: new Date(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'An error occurred during the login process',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createToken(token: string) {
    let decoded = await this.jwtService.decode(token);

    const getUser = await this.prisma.employees.findFirst({
      where: { employee_id: decoded.employee_id },
    });

    if (!getUser) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const tokenRef = this.jwtService.decode(getUser.refresh_token);

    if (!tokenRef || !tokenRef.key) {
      throw new HttpException('Invalid token data', HttpStatus.UNAUTHORIZED);
    }

    const isValidRefreshToken = await this.jwtService.verifyAsync(
      getUser.refresh_token,
      {
        secret: process.env.JWT_SECRET_REFRESH,
      },
    );

    if (!isValidRefreshToken) {
      throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }

    // Create a new token
    const payload = {
      employee_id: getUser.employee_id,
      key: tokenRef.key,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '30s',
      algorithm: 'HS256',
      secret: process.env.JWT_SECRET,
    });

    return accessToken;
  }

  async resetToken(token: string) {
    try {
      await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const accessToken = await this.createToken(token);

      return {
        data: accessToken,
        message: 'Token refreshed',
        status: HttpStatus.OK,
        date: new Date(),
      };
    } catch (error) {
      if (error.message === `invalid signature`)
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);

      const accessToken = await this.createToken(token);

      return {
        data: accessToken,
        message: 'Token refreshed',
        status: HttpStatus.OK,
        date: new Date(),
      };
    }
  }
}
