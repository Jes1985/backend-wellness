const z = require("zod").z;

const createUser = z.object({
  body: z.object({
    user: z.string(),
    profil: z.string(),
    bio: z.string(),
    banner: z.string(),
  }),
});
// Pour tous les updates met exactement les champs du create suivi par .optional(). Uniquement pour les update
const updateUser = z.object({
  body: z.object({
    user: z.string().optional(),
    profil: z.string().optional(),
    bio: z.string().optional(),
    banner: z.string().optional(),
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
