require("dotenv").config();
const App = require("./app");
const { BlogController } = require("./resources/blog/blog.controller");
const {
  CancelOrderController,
} = require("./resources/cancel_order/cancelOrder.controller");
const { UserController } = require("./resources/user/user.controller");
const { SignupController } = require("./resources/signup/signup.controller");
const { AuthController } = require("./resources/auth/auth.controller");
const { ChatController } = require("./resources/chat/chat.controller");
const { CommentController } = require("./resources/comment/comment.controller");
const { OrderController } = require("./resources/order/order.controller");
const { ServiceController } = require("./resources/service/service.controller");
const { VisitorController } = require("./resources/visitor/visitor.controller");
const { StripeController } = require("./resources/stripe/stripe.controller");

const {
  ResetPasswordController,
} = require("./resources/reset_password/reset_password.controller");

const {
  OrderStatController,
} = require("./resources/orderstat/orderstat.controller");

const {
  ChatUserController,
} = require("./resources/chatuser/chatuser.controller");

const {
  BlogCategoryController,
} = require("./resources/blog_categorie/blog_categorie.controller");
const {
  AdminValidateController,
} = require("./resources/admin_validate/admin_validate.controller");
const {
  BlogListAdminController,
} = require("./resources/blog_list_admin/blog_list_admin.controller");

const app = new App(
  [
    new BlogController(),
    new UserController(),
    new CancelOrderController(),
    new SignupController(),
    new AdminValidateController(),
    new AuthController(),
    new BlogCategoryController(),
    new BlogListAdminController(),
    new ChatController(),
    new ChatUserController(),
    new CommentController(),
    new OrderController(),
    new OrderStatController(),
    new ResetPasswordController(),
    new ServiceController(),
    new VisitorController(),
    new StripeController(),
  ],
  8000
);

app.listen();
