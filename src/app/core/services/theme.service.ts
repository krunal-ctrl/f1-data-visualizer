import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class ThemeService {

    private darkMode = signal(false);
    isDarkMode = this.darkMode.asReadonly();

    constructor() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.darkMode.set(savedTheme === 'dark');
        }
        this.applyTheme();
    }

    toggleTheme() {
        this.darkMode.update(value => !value);
        localStorage.setItem('theme', this.darkMode() ? 'dark' : 'light');
        this.applyTheme();
    }


    private applyTheme() {
        if (this.darkMode()) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }
}