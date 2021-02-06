const { ApolloServer, gql, UserInputError } = require('apollo-server')
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
      published: Int!
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
    allBooks: async (root, args) => {
     const results = await Book.find({}).populate('author');
     return results;
    }
  },
  Author: {
    bookCount: (root) => books.filter(b => b.author === root.name).length
  },
  Mutation: {
    addBook: async (root, args) => {
        if (await Author.exists({ name: args.author })) { // if there is an author with a matching name already in db
          const author = await Author.findOne({ name: args.author });
          const newBook = new Book({
            ...args,
            author: author._id
          });
          return await newBook.save(); 
        }
        const newAuthor = new Author({ // if author isn't already in db, first create new author
          name: args.author
        });
        const addedAuthor = await newAuthor.save();
        const newBook = new Book({
          ...args,
          author: addedAuthor._id
        });
        return await newBook.save();
    },
    editAuthor: async (root, args) => { 
      const author = await Author.findOne({ name: args.author});
      author.born = args.birthYear;
      return author.save(); // author.save() from mongoose returns a promise; graphql then returns the value that the promise resolves to
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
