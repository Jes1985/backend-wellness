const z = require("zod").z;

const createProfile = z.object({
  body: z.object({
    profil: z.string(),
    bio: z.string(),
    banner: z.string(),
  }),
});

const updateProfile = z.object({
  body: z.object({
    profil: z.string().optional(),
    bio: z.string().optional(),
    banner: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

const createUser = z.object({
  body: z.object({
    username: z.string(),
    email: z.string(),
    password: z
      .string()
      .min(8, "Password should have at least 8 characters.")
      .regex(
        /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*()_+]/,
        "Password should have alphanumeric characters."
      ),
  }),
});

const updateUser = z.object({
  body: z.object({
    user: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
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

module.exports = { createUser, updateUser, getUser, deleteUser, createProfile, updateProfile };
