import { Response, Request } from "express";
import { Verify } from '../entities/verify.entity';
import { BaseController } from "./base.controller";
import { EntityManager, Connection } from "typeorm";
import { User } from "../entities/user.entity";
import { Controller, Get, Post } from "@overnightjs/core";

@Controller('api/auth')
export class AuthController extends BaseController {

}