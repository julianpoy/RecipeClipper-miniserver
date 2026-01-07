import { JSDOM } from 'jsdom';
import sanitizeHtml from 'sanitize-html';
// @ts-ignore No typings available
import RecipeClipper from '@julianpoy/recipe-clipper';
import workerpool from 'workerpool';
import { ENV } from '../config/environment.js';

const replaceBrWithBreak = (html: string) => {
  return html.replaceAll(new RegExp(/<br( \/)?>/, 'g'), '\n');
};

export interface TextExtractionOptions {
  sanitize?: boolean;
  removeScripts?: boolean;
}

export interface TextData {
  text: string;
}

export interface RecipeExtractionOptions {
  mlDisable?: boolean;
  ignoreMLClassifyErrors?: boolean;
}

export interface RecipeData {
  title?: string;
  description?: string;
  yield?: string;
  activeTime?: string;
  totalTime?: string;
  source?: string;
  url?: string;
  notes?: string;
  ingredients?: string;
  instructions?: string;
  [key: string]: unknown;
}

/**
 * Extract text from HTML using JSDOM
 */
export function extractTextWorker(
  html: string,
  options?: TextExtractionOptions
): TextData {
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

    if (options?.removeScripts !== false) {
      const scripts = window.document.querySelectorAll('script, style');
      scripts.forEach((element) => element.remove());
    }

    const text = window.document.body?.innerText || '';

    return {
      text: text.trim(),
    };
  } finally {
    // CRITICAL: Always close JSDOM window to prevent memory leaks
    if (dom) {
      dom.window.close();
    }
  }
}

/**
 * Extract recipe from HTML using JSDOM and RecipeClipper
 */
export async function extractRecipeWorker(
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

workerpool.worker({
  extractTextWorker,
  extractRecipeWorker,
});
