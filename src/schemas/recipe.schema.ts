export const recipeExtractRequestSchema = {
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
          mlDisable: { type: 'boolean' },
          ignoreMLClassifyErrors: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
};

export const recipeExtractSchema = {
  ...recipeExtractRequestSchema,
};
