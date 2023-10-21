const z = require("zod").z;

const login = z.object({
  body: z.object({
    email: z.string(),
    password: z.string(),
  }),
});

module.exports = { login };
