const z = require("zod").z;

const createStripe = z.object({
  body: z.object({

  }),
});
// Pour tous les updates met exactement les champs du create suivi par .optional(). Uniquement pour les update
const updateStripe = z.object({
  body: z.object({

  }),
  params: z.object({
    id: z.string(),
  })
});

const getStripe = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const deleteStripe = z.object({
  params: z.object({
    id: z.string(),
  }),
});

module.exports = { createStripe, updateStripe, getStripe, deleteStripe };
