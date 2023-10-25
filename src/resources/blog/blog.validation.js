const z = require("zod").z;

const createBlog = z.object({
  body: z.object({
    titre: z.string(),
    time: z.string().datetime(),
    image: z.string(),
    description: z.string(),
    category: z.string(),
  }),
});

const updateBlog = z.object({
  body: z.object({
    titre: z.string().optional(),
    time: z.string().datetime().optional(),
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
