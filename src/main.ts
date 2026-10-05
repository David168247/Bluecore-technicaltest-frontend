import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { App } from "./app/app";
import { routes } from "./app/app.routes";
import { apiInterceptor } from "./app/core/interceptors/api.interceptor";

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideRouter(routes),
  ],
}).catch(console.error);
