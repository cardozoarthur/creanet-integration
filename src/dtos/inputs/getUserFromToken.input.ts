import { IsEnum, IsNumberString, IsOptional, IsStrongPassword, MinLength } from "class-validator";
import { Field, InputType } from "type-graphql";
import { Countries } from "../models/user.model";

@InputType()
export default class GetUserFromTokenInput {
    @Field()
    token: String

    @Field()
    refreshToken: String
}