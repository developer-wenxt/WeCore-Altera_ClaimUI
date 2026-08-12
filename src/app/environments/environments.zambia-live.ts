// apiUrl stays relative: the UI is served under /ClaimUI/ by the same nginx that
// routes /api/* to the backend services, so it resolves against whichever host
// serves this build.
export const environment = {
  production: true,
  apiUrl: '/api'
};
