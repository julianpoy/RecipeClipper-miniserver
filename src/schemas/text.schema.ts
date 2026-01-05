export const textExtractRequestSchema = {
  body: {
    type: 'object',
    required: ['html'],
    properties: {
      html: {
        type: 'string',
        minLength: 1,
        maxLength: 1000000,
      },
      options: {
        type: 'object',
        properties: {
          sanitize: { type: 'boolean' },
          removeScripts: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
};

export const textExtractSchema = {
  ...textExtractRequestSchema,
};
