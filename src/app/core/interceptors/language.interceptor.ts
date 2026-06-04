import { HttpInterceptorFn } from '@angular/common/http';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const currentLang = localStorage.getItem('lang') || 'en';
  // Map our internal 'en'/'ar' to standard locale tags 'en-US' and 'ar-EG'
  const langHeaderValue = currentLang === 'ar' ? 'ar-EG' : 'en-US';
  
  const modifiedReq = req.clone({
    setHeaders: {
      'amf-language': langHeaderValue
    }
  });

  return next(modifiedReq);
};
