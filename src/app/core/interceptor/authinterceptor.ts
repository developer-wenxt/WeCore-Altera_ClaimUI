import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Read token from sessionStorage where SessionService stores it
  const token = sessionStorage.getItem('UserToken');

  // Clone the request and add the authorization header
  const authReq = token ? req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }) : req;

  // Pass the cloned request to the next handler
  return next(authReq);
};
