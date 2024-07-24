import CreateUserInput from "../dtos/inputs/createUser.input"
import GetUserFromTokenInput from "../dtos/inputs/getUserFromToken.input"
import TokenHelper from "../utils/token"

export const APP_SECRET = 'this is my secret'



export class AuthGuard {
    #tokenUtil: TokenHelper
    #refreshTokenUtil: TokenHelper
    constructor(password: string) {
        this.#tokenUtil = new TokenHelper({
            password,
            secret: APP_SECRET,
            // expiration: '15min'
            expiration: '60sec'
        })
        this.#refreshTokenUtil = new TokenHelper({
            password,
            secret: APP_SECRET,
            expiration: '24h'
        })
    }

    static bootstrap(password: string) {
        return new AuthGuard(password)
    }

    signup(data: CreateUserInput) {
        const token = this.#tokenUtil.generate({
            name: data.name.concat(' ', data.surname.toString()),
            email: data.email.toString()
        })

        const refreshToken = this.#refreshTokenUtil.generate({
            name: data.name.concat(' ', data.surname.toString()),
            email: data.email.toString()
        })

        return { token, refreshToken }
    }

    async getUserEmailByToken(data: GetUserFromTokenInput) {
        const token = data.token.toString()
        const refreshToken = data.refreshToken.toString()
        try {
            const user = await this.#tokenUtil.test(token)
            return {
                token,
                user
            }
        } catch (error: any) {
            if (error.message === 'Token expirated') {
                return this.refresh(refreshToken)
            }

            throw error
        }
    }

    async refresh(refreshToken: string) {
        const user = await this.#refreshTokenUtil.test(refreshToken);

        const token = await this.#tokenUtil.generate({
            name: user.name,
            email: user.email.toString()
        })

        return { user, token }
    }
}