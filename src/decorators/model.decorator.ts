import { hashSync, genSaltSync, compare as compareHash } from 'bcryptjs';
import AES128 from '../secure/keys/AES128.enc';
console.clear()

// sha1 | shake128
const cipher = AES128.construct({
    password: 'db.pass',
    secret: 'db.secret'
})

function formatGuard(value: Object, privacity: GuardValues): Object {
    if (privacity === GuardValues.PRIVATE) {
        return cipher.encrypt(value)
    } else if (privacity === GuardValues.SECURE) {
        const salt = genSaltSync(16)

        return hashSync(value.toString(), salt)
    }
    return value
}

function unguard(key: string, privacity: GuardValues, value: Object) {
    if (privacity === GuardValues.PRIVATE) {
        return cipher.decrypt(value.toString());
    }
    return value;
}


export default class Model<T extends Record<string, unknown> = Record<string, unknown>> {
    [key: string]: any
    static Decorator(version: string): ClassDecorator {
        function data(this: any) {
            const prototype = Object.getPrototypeOf(this)
            const properties = prototype.properties

            return Object.fromEntries(Object.entries<GuardValues>(properties).map(([key]) => {
                return [key, this[key]]
            }))
        }
        function unlock(this: any, propertyKey?: string) {
            const prototype = Object.getPrototypeOf(this)
            const properties = prototype.properties
            if (propertyKey) {
                if (properties[propertyKey] !== GuardValues.PRIVATE) {
                    throw new Error(`Property ${propertyKey} is not private`)
                }
                return unguard(propertyKey, properties[propertyKey], this[propertyKey])
            }
            return Object.fromEntries(Object.entries<GuardValues>(properties).map(([key, privacity]) => {
                return [key, unguard(key, privacity, this[key])]
            }));
        }
        async function compare(this: any, value: string, propertyKey: string) {
            const prototype = Object.getPrototypeOf(this)
            const properties = prototype.properties
            // const properties = Object.fromEntries(Object.entries<GuardValues>(prototype.properties).filter(([_, value]) => value === GuardValues.SECURE))
            if (!(propertyKey in properties)) {
                throw new Error(`Property ${propertyKey} not in properties`)
            }
            
            if (properties[propertyKey] !== GuardValues.SECURE) {
                throw new Error(`Property ${propertyKey} is not secure`)
            }

            const valid = await compareHash(value, this[propertyKey])

            if (!valid) {
                throw new Error(`email or password wrong`)
            }

            return valid
        }
        function bootstrap(target: Function) {
            Object.assign(target.prototype, {
                __version: version,
                properties: {},
                unlock,
                compare,
                data,
                encrypt: true
            })
        }
        return bootstrap
    }

    static Guard(this: any, privacity: GuardValues) {
        return (target: Record<string, any>, propertyKey: string) => {
            let _value : Object;
            const getter = function() {
                if (target.decrypt) {
                    return unguard(propertyKey, privacity, _value)
                }
                    return _value
            };
            
            const setter = function(value: Object) {
                target.properties[propertyKey] = privacity
                if (!target.encrypt) {
                    _value = value
                    return value
                }
                _value = formatGuard(value, privacity)
            }

            Object.defineProperty(target, propertyKey, {
                get: getter,
                set: setter
            });
        }
    }

    constructor(data?: T) {
        const prototype = Object.getPrototypeOf(this)

        if (data) {
            for (const [key, record] of Object.entries(data)) {
                this[key] = record
            }
        }
    }

    fromData(this: any, data: Record<string, unknown>): Model {
        const prototype = Object.getPrototypeOf(this)
        prototype.encrypt = false
        prototype.decrypt = true

        for (const [key, record] of Object.entries(data)) {
            this[key] = record
        }
        return this
    }
}

export enum GuardValues {
    PUBLIC = 'public',
    PRIVATE = 'private',
    SECURE = 'secure'
}

// type ModelType<T> = Partial<T>

// @Model.Decorator('1.0.0')
// class ModelT extends Model {

//     @Model.Guard(GuardValues.PUBLIC)
//     id: string

//     @Model.Guard(GuardValues.PRIVATE)
//     email: string
    
//     @Model.Guard(GuardValues.SECURE)
//     password: string

//     constructor(data?: ModelType<ModelT>) {
//         super(data)
//     }
// }

// (async () => {
//     const model = new ModelT({
//         email: 'arthur@gmail.com',
//         id: randomUUID().toString(),
//         password: '12345'
//     })
//     console.log('Model data: ', model.data())
//     // console.log('Model password: ', model.password)
//     // console.log('Model password compare: ', await model.compare('12345', 'password'))
//     const unlocked = model.unlock()
//     // console.log('Model unlocked: ', model.unlock())
//     // console.log('Model unguard email: ', model.unlock('email'))
    
//     const model1 = new ModelT().fromData({
//         email: model.email,
//         password: model.password,
//     })
//     console.log('model1 data: ', model1.data())
// })()