import { ENV } from '../config/environment.js';

export const textExtractRequestSchema = {
  body: {
    type: 'object',
    required: ['html'],
    properties: {
      html: {
        type: 'string',
        minLength: 1,
        maxLength: ENV.MAX_HTML_SIZE,
      },
      options: {
        type: 'object',
        properties: {
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
