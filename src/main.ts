import { greeting } from "./lib/greeting";

function mount(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;
  app.textContent = greeting();
}

mount();
