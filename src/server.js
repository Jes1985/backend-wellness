require("dotenv").config();
const App = require("./app");
const { BlogController } = require("./ressources/blog/blog.controller");
const {
  CancelOrderController,
} = require("./ressources/cancel_order/cancelOrder.controller");
const { UserController } = require("./ressources/signup/signup.controller");

const app = new App(
  [new BlogController(), new UserController(), new CancelOrderController()],
  8000
);

app.listen();
