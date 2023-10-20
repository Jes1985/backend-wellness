const z = require("zod").z;

const createCancelOrder = z.object({
  body: z.object({
    user: z.string(),
    sellerId: z.string(),
    orderId: z.string(),
    reason: z.string(),
    // sender: z.string(),
    // content: z.string(),
    // recipient: z.string(),
  }),
});
// Pour tous les updates met exactement les champs du create suivi par .optional(). Uniquement pour les update
const updateCancelOrder = z.object({
  body: z.object({
    user: z.string().optional(),
    sellerId: z.string().optional(),
    orderId: z.string().optional(),
    reason: z.string().optional(),
    // sender: z.string().optional(),
    // content: z.string().optional(),
    // recipient: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  })
});

const getCancelOrder = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const deleteCancelOrder = z.object({
  params: z.object({
    id: z.string(),
  }),
});

module.exports = { createCancelOrder, updateCancelOrder, getCancelOrder, deleteCancelOrder };
