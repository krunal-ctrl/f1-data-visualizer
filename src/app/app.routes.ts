import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard')
            .then(m => m.Dashboard)
    },
    {
        path: 'drivers',
        loadComponent: () => import('./features/drivers/drivers')
            .then(m => m.Drivers)
    },
    // {
    //     path: 'drivers/:id',
    //     loadComponent: () => import('./features/drivers/driver-detail/driver-detail')
    //         .then(m => m.DriverDetail)
    // },
    {
        path: 'constructors',
        loadComponent: () => import('./features/constructors/constructors')
            .then(m => m.Constructors)
    },
    {
        path: 'races',
        loadComponent: () => import('./features/races/races')
            .then(m => m.Races)
    },
    {
        path: 'circuits',
        loadComponent: () => import('./features/circuits/circuits')
            .then(m => m.Circuits)
    },
    {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/analytics')
            .then(m => m.Analytics)
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
