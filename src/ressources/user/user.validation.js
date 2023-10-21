const z = require("zod").z;

const createUser = z.object({
  body: z.object({
    username: z.string(),
    email: z.string(),
    password: z.string(),
  }),
});

const updateusername = z.object({
  body: z.object({
    user: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  })
});

const getUser = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const deleteUser = z.object({
  params: z.object({
    id: z.string(),
  }),
});

module.exports = { createUser, updateUser, getUser, deleteUser };
