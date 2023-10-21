const z = require("zod").z;

const createOrder = z.object({
  body: z.object({
    user: z.string(),
    serviceId: z.string(),
    sellerId: z.string(),
    price: z.string(),
    delai: z.string(),
    costumservice: z.string(),
    clientName: z.string(),
    clientFirstName: z.string(),
    clientAddresse: z.string(),
    clientEmail: z.string(),
  }),
});
// Pour tous les updates met exactement les champs du create suivi par .optional(). Uniquement pour les update
const updateOrder = z.object({
  body: z.object({
    user: z.string().optional(),
    serviceId: z.string().optional(),
    sellerId: z.string().optional(),
    price: z.string().optional(),
    delai: z.string().optional(),
    costumservice: z.string().optional(),
    clientName: z.string().optional(),
    clientFirstName: z.string().optional(),
    clientAddresse: z.string().optional(),
    clientEmail: z.string().optional(),
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
