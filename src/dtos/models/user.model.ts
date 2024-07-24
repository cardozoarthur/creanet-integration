import { IsEnum, IsNumberString, IsOptional, IsStrongPassword, MinLength, minLength } from "class-validator"
import { Field, ObjectType } from "type-graphql"
import Model, { GuardValues } from "../../decorators/model.decorator"

export enum Countries {
    BRAZIL = 'BRAZIL',
    URUGUAY = 'URUGUAY'
}

@ObjectType()
@Model.Decorator('1.0.0')
export default class UserModel extends Model {
    @Field()
    @Model.Guard(GuardValues.PUBLIC)
    name: String

    @Field()
    @Model.Guard(GuardValues.PRIVATE)
    surname: String

    @Field()
    @Model.Guard(GuardValues.PRIVATE)
    fullname: String

    @Field()
    @Model.Guard(GuardValues.PRIVATE)
    email: String
    
    @Field()
    @Model.Guard(GuardValues.SECURE)
    password: String

    @Field({
        nullable: true
    })
    @IsOptional()
    @Model.Guard(GuardValues.PUBLIC)
    resume?: String

    @Field(() => String)
    @IsEnum(Countries)
    @Model.Guard(GuardValues.PUBLIC)
    country: Countries

    @Field()
    @MinLength(8)
    @IsNumberString()
    @Model.Guard(GuardValues.PRIVATE)
    zipcode: String

    @Field()
    @Model.Guard(GuardValues.PRIVATE)
    state: String

    @Field()
    @Model.Guard(GuardValues.PRIVATE)
    city: String

    @Field()
    @Model.Guard(GuardValues.PRIVATE)
    neighborhood: String

    @Field()
    @Model.Guard(GuardValues.PRIVATE)
    street: String

    @Field({
        nullable: true
    })
    @IsOptional()
    @Model.Guard(GuardValues.PRIVATE)
    street_number?: String

    @Field({
        nullable: true
    })
    @IsOptional()
    @Model.Guard(GuardValues.PRIVATE)
    complement?: String

    @Field({
        nullable: true
    })
    @IsOptional()
    token?: String
}