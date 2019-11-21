import { Args, Resolver, Query } from '@nestjs/graphql';
import gql from 'graphql-tag';
import { Customer, OrderService, VendurePlugin, PluginCommonModule, RequestContext, Ctx, Allow, Permission } from '@vendure/core';
import { Connection } from 'typeorm';

const schemaExtension = gql`
  extend type Query {
    ordersByEmail(emailAddress: String!): [Order!]!
  }
`;

@Resolver()
export class OrdersByEmailResolver {
    constructor(private connection: Connection, private orderService: OrderService) { }

    @Query()
    @Allow(Permission.ReadOrder)
    async ordersByEmail(@Ctx() ctx: RequestContext, @Args() args: any) {
        const customer = await this.connection.getRepository(Customer).findOne({
            where: { emailAddress: args.emailAddress }
        });
        if (!customer) {
            return [];
        }
        return this.orderService.findByCustomerId(ctx, customer.id).then(result => result.items);
    }
}

@VendurePlugin({
    imports: [PluginCommonModule],
    adminApiExtensions: {
        schema: schemaExtension,
        resolvers: [OrdersByEmailResolver],
    }
})
export class OrdersByEmailPlugin { }
