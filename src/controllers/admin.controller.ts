import { Response, Request } from "express";
import { Controller, Post } from "@overnightjs/core";
import { Opening } from "../entities/opening.entity";
import { Connection } from "typeorm";

@Controller('api/admin')
export class AdminController {
}