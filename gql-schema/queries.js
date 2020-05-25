const { ApolloServer } = require("apollo-server-express");
const bcrypt = require("bcrypt");
const uuid = require("uuid/v1");
const fs = require("fs");

// mongoose models
const Member = require("../models/Member");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");

// typeDefs
const { typeDefs, customScalarResolver } = require("./types");

// CRUD

const resolvers = {
  Query: {
    getMember: (_, args) => {
      console.log("trying to search for id: " + args.id);
      return Member.findById(args.id);
    },

    getMembers: (_, args) => {
      console.log(args);

      if (!args.id) {
        console.log("no argument was passed");
        return Member.find({});
      }
      console.log("searching id: " + args.id);
      return Member.findById(args.id);
    },

    getCategories: (_, args) => {
      return Category.find({});
    },

    getCategory: (_, args) => {
      return Category.findById(args.id);
    },

    getProducts: () => {
      return Product.find({});
    },

    getProduct: (_, args) => {
      return Product.findById(args.id);
    },
  },

  // // // get category of a product
  ProductType: {
    // declare a resolver teams inside TaskType
    categories: (parent, args) => {
      console.log(parent.categories);
      return parent.categories.map((category) => {
        console.log(category.categoryId);
        return Category.findById(category.categoryId).then((res) => {
          let categoryData = {
            id: category.id,
            name: res.name,
            shop: res.shop,
            price: category.price,
          };

          return categoryData;
        });
      });
    },
  },

  CategoryType: {
    products: (parent, args) => {
      return Product.find({ categoryId: parent.id });
    },
  },

  // custom TeamType resolver
  Mutation: {
    createProduct: (_, args) => {
      console.log(args);
      let categoriesData = [
        { categoryId: "5ec5b8f311a78f03911ae47e", price: 125.0 },
        { categoryId: "5ec5b90411a78f03911ae47f", price: 140.0 },
        { categoryId: "5ec5b90f11a78f03911ae480", price: 140.0 },
      ];

      let newProduct = Product({
        name: args.name,
        price: args.price,
        shop: args.shop,
        image_location: args.image_location,
        categories: categoriesData,
      });

      return newProduct.save();
    },

    addToCart: (_, args) => {
      console.log(args)
      const query = Member.findById(args.userId);
      return query
        .then((user) => {
          // console.log(user);
          // console.log(args);

          const newCartItem = {
            quantity: args.quantity,
            itemId: args.itemId,
            categoryId : args.categoryId
          };

          for (let i = 0; i < user.cart.length; i++) {
            if (user.cart[i].itemId == args.itemId && user.cart[i].categoryId == args.categoryId ) {
              user.cart[i].quantity += args.quantity;
              user.save();
              return true;
            }
          }

          user.cart.push(newCartItem);
          user.save();
          return true;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    },

    updateCartItem: (_, args) => {
      const query = Member.findById(args.userId);

      return query
        .then((user) => {
          console.log(user);
          for (let i = 0; i < user.cart.length; i++) {
            if (user.cart[i].itemId == args.itemId) {
              user.cart[i].quantity = args.quantity;
              user.save();
              return true;
            }
          }
        })
        .catch((err) => {
          return false;
        });
    },

    emptyCart: (_, args) => {
      const query = Member.findById(args.userId);

      return query
        .then((user) => {
          // console.log(user);
          user.cart = [];
          user.save();
          return true;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    },

    deleteCartItem: (_, args) => {
      const query = Member.findById(args.userId);

      query
        .then((user) => {
          const cart = user.cart;
          console.log(user);

          for (let i = 0; i < cart.length; i++) {
            if (cart[i].itemId == args.itemId) {
              user.cart.splice(i, 1);
              user.save();
            }
          }

          return true;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    },

    createTransaction: (_, args) => {
      let newTrasaction = Transaction({
        email: args.email,
        amount: args.amount,
        description: args.description,
      });

      return newTrasaction.save();
    },

    createCategory: (_, args) => {
      // console.log(args);
      let newCategory = Category({
        name: args.name,
        shop: args.shop,
        image_location: args.image_location,
      });
      return newCategory.save();
    },

    createMember: (_, args) => {
      let newMember = Member({
        first_name: args.first_name,
        last_name: args.last_name,
        address: args.address,
        contact_number: args.contact_number,
        email: args.email,
        username: args.username,
        password: bcrypt.hashSync(args.password, 10),
      });

      console.log(newMember);

      return newMember.save();
    },

    updateMember: (_, args) => {
      console.log(args);

      let condition = { _id: args.id };
      let updates = {
        first_name: args.first_name,
        last_name: args.last_name,
        position: args.position,
      };

      return Member.findOneAndUpdate(condition, updates);
    },

    logInMember: (_, args) => {
      // console.log("trying to log in...");
      // console.log(args);

      return Member.findOne({ email: args.email }).then((member) => {
        console.log(member);
        // username has no matches in our database
        if (member === null) {
          console.log("member not found");
          return null;
        }

        let hashedPassword = bcrypt.compareSync(args.password, member.password);
        console.log("this is the value of hashedPassword: " + hashedPassword);

        // if condition is fulfilled, passwords do not match
        if (!hashedPassword) {
          console.log("wrong password");
          return null;
        }
        // else output in the console successful and return member
        else {
          // successful login
          console.log("success");
          return member;
        }
      });
    },
  },
};

// create an instance of the Apollo Server
// in the most basic sense, the ApolloServer can be started
// by passing the type definitions(typeDefs) and the resolvers
// responsivle for fetching the data for those type definitions
const server = new ApolloServer({ typeDefs, resolvers });

module.exports = server;
