import { Arg, FieldResolver, ID, Mutation, Query, Resolver, Root, Subscription } from "type-graphql";
import { pubSub } from "../pubSub";
import CreateUserInput from "../dtos/inputs/createUser.input";
import UserModel from "../dtos/models/user.model";
import { AuthGuard } from "../secure/auth";
import { prisma } from "../utils/db";
import GetUserFromTokenInput from "../dtos/inputs/getUserFromToken.input";
import { createGraphQLError } from "graphql-yoga";
import SigninUserInput from "../dtos/inputs/signinUser.input";
import TokenModel from "../dtos/models/token.model";

@Resolver(() => UserModel)
export default class UserResolver {
    authGuard = AuthGuard.bootstrap('password')
    @Query(() => UserModel)
    async getUserFromToken(
        @Arg('data')
        input: GetUserFromTokenInput
    ) {
        try {
            const { user: { email }, token } = await this.authGuard.getUserEmailByToken(input)
    
            const user = await prisma.user.findUniqueOrThrow({
                where: {
                    email
                }
            })

            if (!user) throw new Error('User not found')

            const data = new UserModel().fromData(user).data()

            delete data.password
    
            return Object.assign(data, token)
        } catch (error: any) {
            console.error(error)
            if ('message' in error) {
                throw createGraphQLError(error.message, {
                    originalError: error,
                    path: error.path
                })
            }
        }
    }

    @Mutation(() => TokenModel)
    async createUser(
        @Arg('data')
        input: CreateUserInput
    ) {
        try {
            input.fullname = `${input.name} ${input.surname}`
            const data = new UserModel({...input}).data()
            const user = await prisma.user.create({
                data
            })
    
            const token = await this.authGuard.signup(data)
            return token
        } catch (error: any) {
            const err = createGraphQLError(error.name, {
                originalError: error
            })

            throw err
        }
    }

    @Mutation(() => TokenModel)
    async signinUser(
        @Arg('data')
        input: SigninUserInput
    ) {
        try {
            const model = new UserModel({
                email: input.email,
                password: input.password
            })
            const data = model.data()
            const user = await prisma.user.findUniqueOrThrow({
                where: {
                    email: data.email
                }
            })

            model.fromData(user)

            await model.compare(input.password, 'password')
    
            const token = await this.authGuard.signup(user as any)
            return token
        } catch (error: any) {
            console.error(error)
            const err = createGraphQLError(error.name, {
                originalError: error
            })

            throw err
        }
    }
}