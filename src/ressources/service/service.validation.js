const z = require("zod").z;

const createService = z.object({
  body: z.object({
    user: z.string(),
    title: z.string(),
    category: z.string(),
    souscategory: z.string(),
    cities: z.string(),
  }),
});
// Pour tous les updates met exactement les champs du create suivi par .optional(). Uniquement pour les update
const updateService = z.object({
  body: z.object({
    user: z.string().optional(),
    title: z.string().optional(),
    category: z.string().optional(),
    souscategory: z.string().optional(),
    cities: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  })
});

const getService = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const deleteService = z.object({
  params: z.object({
    id: z.string(),
  }),
});

module.exports = { createService, updateService, getService, deleteService };
