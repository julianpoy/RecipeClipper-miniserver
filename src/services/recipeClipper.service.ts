import { JSDOM } from 'jsdom';
import sanitizeHtml from 'sanitize-html';
// @ts-ignore No typings available
import RecipeClipper from '@julianpoy/recipe-clipper';
import { ENV } from '../config/environment.js';

const replaceBrWithBreak = (html: string) => {
  return html.replaceAll(new RegExp(/<br( \/)?>/, 'g'), '\n');
};

export interface RecipeExtractionOptions {
  mlDisable?: boolean;
  ignoreMLClassifyErrors?: boolean;
}

export interface RecipeData {
  name?: string;
  ingredients?: string[];
  instructions?: string[];
  time?: {
    prep?: string;
    cook?: string;
    total?: string;
  };
  yield?: string;
  image?: string;
  [key: string]: unknown;
}

export async function extractRecipe(
  html: string,
  options?: RecipeExtractionOptions
): Promise<RecipeData> {
  let dom: JSDOM | null = null;

  try {
    dom = new JSDOM(html, {
      url: 'http://localhost',
      contentType: 'text/html',
      includeNodeLocations: false,
    });

    const { window } = dom;

    Object.defineProperty(window.Element.prototype, 'innerText', {
      get() {
        const html = replaceBrWithBreak(this.innerHTML);
        return sanitizeHtml(html, {
          allowedTags: [], // remove all tags and return text content only
          allowedAttributes: {}, // remove all tags and return text content only
        });
      },
    });

    // Set up fetch for RecipeClipper (needed for ML classifier)
    (window.fetch as any) = fetch;

    const recipeData = await RecipeClipper.clipRecipe({
      window,
      mlDisable: options?.mlDisable ?? false,
      mlClassifyEndpoint: ENV.INGREDIENT_INSTRUCTION_CLASSIFIER_URL || undefined,
      ignoreMLClassifyErrors: options?.ignoreMLClassifyErrors ?? true,
    });

    return recipeData;
  } finally {
    // CRITICAL: Always close JSDOM window to prevent memory leaks
    if (dom) {
      dom.window.close();
    }
  }
}
