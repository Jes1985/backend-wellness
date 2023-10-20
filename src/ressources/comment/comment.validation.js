const z = require("zod").z;

const createComment = z.object({
  body: z.object({
    user: z.string(),
    name: z.string(),
    text: z.string(),
    star: z.string(),
  }),
});
// Pour tous les updates met exactement les champs du create suivi par .optional(). Uniquement pour les update
const updateComment = z.object({
  body: z.object({
    user: z.string().optional(),
    name: z.string().optional(),
    text: z.string().optional(),
    star: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  })
});

const getComment = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const deleteComment = z.object({
  params: z.object({
    id: z.string(),
  }),
});

module.exports = { createComment, updateComment, getComment, deleteComment };
