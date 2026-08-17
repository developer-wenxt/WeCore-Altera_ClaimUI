import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { GlobalMessageService } from '../services/GlobalMessageService';

export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const globalMessage = inject(GlobalMessageService);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body as any;
        if (body) {
          const status = body.status || body.data?.status;
          const backendMessage = body.data?.message || body.message || body.msg;

          if (backendMessage && req.method !== 'GET') {
            const isErrorStatus = status === 'error' || status === 'ERROR' || status === 'Error';

            if (isErrorStatus) {
              globalMessage.show('error', 'Error', backendMessage);
            } else {
              globalMessage.show('success', 'Success', backendMessage);
            }
          }
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'An unexpected error occurred';
      const errBody = error.error as any;

      if (errBody) {
        if (errBody.data && errBody.data.message) {
          errorMsg = errBody.data.message;
        } else if (errBody.message) {
          errorMsg = errBody.message;
        } else if (typeof errBody === 'string') {
          errorMsg = errBody;
        } else if (errBody.error && typeof errBody.error === 'string') {
          errorMsg = errBody.error;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      globalMessage.show('error', 'Error', errorMsg);

      return throwError(() => error);
    })
  );
};