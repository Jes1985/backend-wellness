const z = require("zod").z;

const createChat = z.object({
  body: z.object({
    sender: z.string(),
    content: z.string(),
    recipient: z.string(),
  }),
});

const updateChat = z.object({
  body: z.object({
    sender: z.string().optional(),
    content: z.string().optional(),
    recipient: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  })
});

const getChat = z.object({
  params: z.object({
    id: z.string(),
  }),
});


module.exports = { createChat, updateChat, getChat, deleteChat };
