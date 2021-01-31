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
    bookCount(author: String): Int!
    authorCount: Int!
    allBooks(author: String): [Book!]!
    allAuthors: [Author!]!
  }
`
// resolvers object contains objects holding resolvers for a type
// resolver functions have 4 parameters: 1. root (also called 'parent'), 2. args, 3. context, 4. info 
const resolvers = {
  Query: { // type
    bookCount: () => books.length, // each field of the type requires a resolver function
    authorCount: () => authors.length,
    allAuthors: () => authors,
    // 'root' parameter is necessary here even though it is not used. when there is only one parameter, it is treated as the first parameter (of the four params that are passed into the resolver). therefore if there is only an 'args' parameter, 'args' is actually root (ie it cannot be used to access the resolver's parameters). so don't follow linter suggestions blindly
    allBooks: (root, args) => { 
        if (args.author) {
          return books.filter(book => book.author === args.author)
        }
        return books
    }
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