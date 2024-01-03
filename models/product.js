const fs = require("fs");
const path = require("path");
const Cart = require("./cart");
const getDb = require("../helper/database").getDb;

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "products.json"
);


const getProductsFromDB = (callback) => {
  const db = getDb();
  return db
    .collection("products")
    .find({})
    .toArray()
    .then((product) => {
      return callback(product);
    })
    .catch((err) => {
      console.log(err);
    });
};

class Product {
  constructor(title, price, description, imageURL) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageURL = imageURL;
  }

  save() {
    const db = getDb();
    return db
      .collection("products")
      .insertOne(this)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static fetchAll(callback) {
    getProductsFromDB(callback);
  }
}

const getProductsFromFile = (callback) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      callback([]);
    } else {
      callback(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageURL, description, price) {
    this.id = id;
    this.title = title;
    this.imageURL = imageURL;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          (x) => x.id === this.id
        );
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
          console.log(err);
        });
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), (err) => {
          console.log(err);
        });
      }
    });
  }

  static deleteById(id) {
    getProductsFromFile((products) => {
      const product = products.find((x) => x.id === id);
      const updatedProducts = products.filter((x) => x.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
        if (!err) {
          Cart.deleteProduct(id, product.price);
        }
      });
    });
  }

  static fetchAll(callback) {
    getProductsFromFile(callback);
  }

  static getProductById(id, callback) {
    getProductsFromFile((products) => {
      const product = products.find((x) => x.id === id);
      callback(product);
    });
  }
};

module.exports = Product;