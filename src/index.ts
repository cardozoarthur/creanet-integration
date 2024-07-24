import 'reflect-metadata';
import { buildSchemaSync } from 'type-graphql';
import { createYoga } from 'graphql-yoga';
import { CustomAuthChecker } from './secure/guard';
import UserResolver from './resolvers/Users.resolver';

export default function bootstrap() {
  const schema = buildSchemaSync({
    resolvers: [UserResolver],
    validate: true,
    emitSchemaFile: false,
    // authChecker: CustomAuthChecker,
    // authMode: "null"
  });

  const graphqlServer = createYoga({
    schema,
    healthCheckEndpoint: '/live',
    landingPage: false,
    graphiql: {
      subscriptionsProtocol: 'WS', // Habilitar protocolo de assinaturas WebSocket no GraphiQL
    },
  });

  return graphqlServer
}
