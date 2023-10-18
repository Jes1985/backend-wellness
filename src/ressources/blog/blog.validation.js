const z = require("zod").z;

const createBlog = z.object({
  body: z.object({
    titre: z.string(),
    time: z.string(),
    image: z.string(),
    description: z.string(),
    category: z.string(),
  }),
});
// Pour tous les updates met exactement les champs du create suivi par .optional(). Uniquement pour les update
const updateBlog = z.object({
  body: z.object({
    titre: z.string().optional(),
    time: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  })
});

const getBlog = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const deleteBlog = z.object({
  params: z.object({
    id: z.string(),
  }),
});

module.exports = { createBlog, updateBlog, getBlog, deleteBlog };
