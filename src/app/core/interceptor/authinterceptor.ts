import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Retrieve the token from local storage (or your auth service)
  const token = localStorage.getItem('access_token');

  // Clone the request and add the authorization header
  const authReq = token ? req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }) : req;

  // Pass the cloned request to the next handler
  return next(authReq);
};
