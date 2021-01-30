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
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks: [Book!]!
    allAuthors: [Author!]!
  }
`
const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: () => books,
    allAuthors: () => authors
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})