import { IsEnum, IsNumberString, IsOptional, IsStrongPassword, MinLength } from "class-validator";
import { Field, InputType } from "type-graphql";
import { Countries } from "../models/user.model";

@InputType()
export default class CreateUserInput {
    @Field()
    name: String

    @Field()
    surname: String

    @Field({
        nullable: true
    })
    fullname?: String

    @Field()
    email: String
    
    @Field()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 0,
        minUppercase: 1
    })
    password: String

    @Field({
        nullable: true
    })
    @IsOptional()
    resume?: String

    @Field(() => String)
    @IsEnum(Countries)
    country: Countries

    @Field()
    @MinLength(8)
    @IsNumberString()
    zipcode: String

    @Field()
    state: String

    @Field()
    city: String

    @Field()
    neighborhood: String

    @Field()
    street: String

    @Field({
        nullable: true
    })
    @IsOptional()
    street_number?: String

    @Field({
        nullable: true
    })
    @IsOptional()
    complement?: String
}