import { Field, ObjectType } from "type-graphql";

type signToken = {token: String, refreshToken: String}

@ObjectType()
export default class TokenModel {
    @Field()
    token: String

    @Field()
    refreshToken: string
}