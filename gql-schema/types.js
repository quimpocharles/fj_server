const { gql } = require("apollo-server-express");

const { GraphQLDateTime } = require("graphql-iso-date");

const typeDefs = gql`
  scalar Date

  type ProductType {
    id: ID
    name: String
    shop: String
    image_location: String
    categories: [CategoryType]
  }

  type TransactionType {
    id: ID
    branch: String
    establishment: String
    description: String
    email: String
    amount: String
  }

  type CategoryType {
    id: ID
    name: String!
    shop: String
    price: Float
    products: [ProductType]
  }

  type MemberType {
    id: ID
    first_name: String!
    last_name: String!
    address: String!
    username: String!
    email: String!
    contact_number: String!
    password: String!
    cart: [CartType]
    createdAt: Date
    updatedAt: Date
  }

  type CartType {
    quantity: Int!
    itemId: String
    categoryId : String
  }

  type TeamType {
    id: ID
    name: String
  }

  type Query {
    # square brackets indicate that we are expecting an array
    getMembers: [MemberType]
    getTeams: [TeamType]
    getMember(id: String!): MemberType
    getTeam(id: String!): TeamType
    getProducts: [ProductType]
    getProduct(id: String): ProductType
    getCategories: [CategoryType]
    getCategory(id: String): CategoryType
  }

  #CUD functionality
  #we are mutating the server/database
  type Mutation {
    createMember(
      first_name: String
      last_name: String
      address: String
      email: String!
      contact_number: String!
      username: String!
      password: String!
    ): MemberType

    createCategory(
      name: String!
      shop: String!
      price: Float
      image_location: String
    ): CategoryType

    addToCart(userId: String, itemId: String, quantity: Int, categoryId : String): Boolean

    updateCartItem(userId: String, itemId: String, quantity: Int): Boolean
    deleteCartItem(userId: String, itemId: String): Boolean

    emptyCart(userId: String): Boolean

    createProduct(
      name: String!
      image_location: String
      shop: String!
    ): ProductType

    createTeam(name: String): TeamType

    updateMember(
      id: ID!
      first_name: String
      last_name: String
      position: String
    ): MemberType

    logInMember(email: String, password: String): MemberType

    createTransaction(
      description: String
      establishment: String
      branch: String
      email: String
      amount: String
    ): TransactionType
  }
`;
// resolvers have 4 built in parameters passed into them
// (parent, args, content, info)
// args - arguments passed with the request
const customScalarResolver = {
  Date: GraphQLDateTime,
};

module.exports = { typeDefs, customScalarResolver };
