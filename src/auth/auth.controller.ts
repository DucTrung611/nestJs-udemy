import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';


@Controller("/auth")
export class AuthController {
    constructor(
        private authService: AuthService,
        private roleService: RolesService
    ) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post("/login")
    @ResponseMessage("user login")
    handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
    }

    @Public()
    @ResponseMessage("register account")
    @Post("/register")
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto)
    }

    @ResponseMessage("get user information")
    @Get("account")
    async handleGetAccount(@User() user: IUser) {
        const temp = await this.roleService.findOne(user.role._id) as any;
        user.permissions = temp.permissions;
        return { user };
    }

    @Public()
    @ResponseMessage("Get User by refresh token")
    @Get("/refresh")
    handleRefreshToken(@Req() request: Request, @Req() req, @Res({ passthrough: true }) response: Response) {
        const refresh_token = request.cookies['refresh_token']
        return this.authService.processNewToken(refresh_token, response);
    }

    @ResponseMessage("logout user")
    @Get("/logout")
    handleLogout(@User() user: IUser, @Req() req, @Res({ passthrough: true }) response: Response) {
        return this.authService.logout(user, response);
    }
}
