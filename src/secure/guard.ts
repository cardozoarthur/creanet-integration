import { GraphQLError } from "graphql";
import { createGraphQLError } from "graphql-yoga";
import { IncomingMessage } from "node:http";
import { AuthCheckerInterface, ResolverData } from "type-graphql";
import { prisma } from "../utils/db";
import { AuthGuard } from "./auth";

interface Context {
  request: {
    url: string
    baseUrl: string
    method: string
    options: {
      method: string
      headers: Record<string, unknown>
      body: IncomingMessage
    }
    headers: {
      headersInit: HeadersInit & {
        host: string
        token: string
        refresh_token: string
        origin: string
      },
      _setCookies: unknown[]
    }
  }
}

type ContextType = Context & Record<string, unknown>

export class CustomAuthChecker implements AuthCheckerInterface<ContextType> {
  authGuard = AuthGuard.bootstrap('password')
  constructor(
        // Dependency injection
      //   private readonly userRepository: Repository<User>,
  ) {}
  
  async check({ root, args, context, info }: ResolverData<ContextType>, roles: string[]) {
    const {
      host,
      origin,
      token,
      refresh_token: refreshToken,
    } = context.request.headers.headersInit

    const {
      fieldName: fieldname,
      path: { typename }
    } = info

    const {
      data
    } = args

    const { user: { email }, token: newToken } = await this.authGuard.getUserEmailByToken({
      token,
      refreshToken
    })
    
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email
        },
        select: {
          id: true
        }
    })

    console.log({
      user,
      data,
      fieldname,
      typename,
      host,
      origin
    })

    return true
  }
}
  
  