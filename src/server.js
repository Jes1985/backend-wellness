require("dotenv").config();
const App = require("./app");
const { BlogController } = require("./ressources/blog/blog.controller");

const app = new App([new BlogController()], 8000);

app.listen();
