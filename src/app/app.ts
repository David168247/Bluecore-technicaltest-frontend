import { Component, effect, inject } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { AuthService } from "./core/services/auth.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./app.html",
})
export class App {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (
        this.auth.sessionEnded() === "expired" &&
        !this.auth.authenticated()
      ) {
        void this.router.navigate(["/login"], {
          queryParams: { expired: "1" },
        });
      }
    });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(["/login"]);
  }
}
