const { ApolloServer, gql } = require('apollo-server')
const { v1: uuid } = require('uuid');
const mongoose = require('mongoose');

const { mongoUri } = require('./constants');
const Book = require('./models/Book');
const Author = require('./models/Author');

console.log('connecting to', mongoUri);

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

// Schema type descriptions 
// schema descriptions are kinda like typescript interfaces 
// ! after value type means the value must be non-null 

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author
    id: ID!
    genres: [String]
  }
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Mutation {
    addBook(
      title: String!
      published: String!
      author: String!
      genres: [String]
    ): Book
    editAuthor(
      author: String!
      birthYear: Int!
    ): Author
  }

  type Query {
    bookCount(author: String): Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }
`

// resolvers object contains objects holding resolvers for a type
// resolver functions have 4 parameters: 1. root (also called 'parent'), 2. args, 3. context, 4. info 
const resolvers = {
  Query: { // type
    bookCount: () => Book.collection.countDocuments(), // each field of the type requires a resolver function
    authorCount: () => Author.collection.countDocuments(),
    allAuthors: () => Author.find({}),
    // 'root' parameter is necessary here even though it is not used. when there is only one parameter, it is treated as the first parameter (of the four params that are passed into the resolver). therefore if there is only an 'args' parameter, 'args' is actually root (ie it cannot be used to access the resolver's parameters). so don't follow linter suggestions blindly
    allBooks: (root, args) => Book.find({})
  },
  Author: {
    bookCount: (root) => books.filter(b => b.author === root.name).length
  },
  Mutation: {
    addBook: (root, args) => {
      const newBook = {
        ...args,
        id: uuid(),
      }
      books = books.concat(newBook);
      if (!authors.find(a => a.name === args.author)) {
        const newAuthor = {
          name: args.author,
          id: uuid()
        }
        authors = authors.concat(newAuthor)
      }
      return newBook;
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.author});
      author.born = args.birthYear;
      return author.save();
    }
  }
}

const server = new ApolloServer({
  typeDefs, // schema
  resolvers, // resolvers object defined at line 33
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
