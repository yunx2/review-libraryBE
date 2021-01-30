const { ApolloServer, gql } = require('apollo-server')

const books = require('./data/books.js').books;
const authors = require('./data/authors.js').authors;

// Schema type descriptions 
// schema descriptions are kinda like typescript interfaces 
// ! after value type means the value must be non-null 
const typeDefs = gql`
  type Book {
    title: String!
    published: String!
    author: String!
    id: ID!
    genres: [String]
  }
  type Author {
    name: String!
    id: ID!
    born: String
    bookCount: Int!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks: [Book!]!
    allAuthors: [Author!]!
  }
`
// resolvers object contains objects holding resolvers for a type
const resolvers = {
  Query: { // type
    bookCount: () => books.length, // each field of the type requires a resolver function
    authorCount: () => authors.length,
    allBooks: () => books,
    allAuthors: () => authors
  },
  Author: {
    bookCount: (root) => books.filter(b => b.author === root.name).length
  }
}

const server = new ApolloServer({
  typeDefs, // schema
  resolvers, // resolvers object defined at line 33
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})