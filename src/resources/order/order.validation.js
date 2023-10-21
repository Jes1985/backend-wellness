const z = require("zod").z;

const createOrder = z.object({
  body: z.object({
    cart: z.object({
      // serviceId
      // sellerId
      // price
      // delai
    }),
    FirstName: z.string(),
    LastName: z.string(),
    AddressLine1: z.string(),
    Email: z.string(),
  }),
});
// Pour tous les updates met exactement les champs du create suivi par .optional(). Uniquement pour les update
const updateOrder = z.object({
  body: z.object({
    cart: z.object({

    }),
    FirstName: z.string().optional(),
    LastName: z.string().optional(),
    AddressLine1: z.string().optional(),
    Email: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  })
});

const getOrder = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const deleteOrder = z.object({
  params: z.object({
    id: z.string(),
  }),
});

module.exports = { createOrder, updateOrder, getOrder, deleteOrder };
