import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

export class CustomMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    console.warn(`[Missing Translation] The key '${params.key}' is missing in the translation file.`);
    // Return the key itself so the user sees something instead of nothing
    return params.key;
  }
}
