import { Response, Request } from "express";
import { Verify } from '../entities/verify.entity';
import { BaseController } from "./base.controller";
import { EntityManager, Connection } from "typeorm";
import { Reseller } from "../entities/reseller.entity";
import { Controller, Get, Post } from "@overnightjs/core";

@Controller('api/auth')
export class AuthController extends BaseController {

}