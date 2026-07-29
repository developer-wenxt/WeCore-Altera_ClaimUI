import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

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
              messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: backendMessage,
                life: 5000
              });
            } else {
              messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: backendMessage,
                life: 3000
              });
            }
          }
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'An unexpected error occurred';
      const errBody = error.error as any;

      // Extract the exact error message provided by the backend (checking data.message first)
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

      messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMsg,
        life: 5000
      });

      return throwError(() => error);
    })
  );
};
