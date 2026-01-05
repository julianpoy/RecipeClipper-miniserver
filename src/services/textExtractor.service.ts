import { JSDOM } from 'jsdom';
import sanitizeHtml from 'sanitize-html';

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

export function extractBodyText(
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
