# Angular Frontend Implementation Guide

## Overview
This guide explains how to implement JWT authentication and consume the backend API endpoints in your Angular application.

## 1. Authentication Service

### Create Auth Service
```bash
ng generate service core/services/auth
```

### `auth.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface LoginResponse {
  access_token: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // Update with your backend URL
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Load user from token on service initialization
    this.loadUserFromToken();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          // Store token
          localStorage.setItem('access_token', response.access_token);
          // Decode and store user info
          this.loadUserFromToken();
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      try {
        const payload = this.decodeToken(token);
        this.currentUserSubject.next({
          id: payload.id,
          email: payload.email,
          role: payload.role
        });
      } catch (error) {
        console.error('Invalid token', error);
        this.logout();
      }
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    return this.currentUserSubject.value?.role || null;
  }
}
```

## 2. HTTP Interceptor for JWT

### Create Interceptor
```bash
ng generate interceptor core/interceptors/auth
```

### `auth.interceptor.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get token from auth service
    const token = this.authService.getToken();

    // Clone request and add Authorization header if token exists
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired or invalid - logout user
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
```

### Register Interceptor in `app.config.ts` or `app.module.ts`

**For Standalone (Angular 17+):**
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

**For Module-based:**
```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

## 3. Station Service

### Create Station Service
```bash
ng generate service features/station/services/station
```

### `station.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Station {
  id: string;
  name: string;
  address: string;
  petrolVolume: number;
  dieselVolume: number;
  petrolPricePerLitre: number;
  dieselPricePerLitre: number;
  status: 'active' | 'suspended';
  // Add other fields as needed
}

@Injectable({
  providedIn: 'root'
})
export class StationService {
  private apiUrl = 'http://localhost:3000/station';

  constructor(private http: HttpClient) {}

  // Get manager's assigned station (uses JWT token automatically via interceptor)
  getMyStation(): Observable<Station> {
    return this.http.get<Station>(`${this.apiUrl}/mine`);
  }

  // Get all stations (Director only)
  getAllStations(): Observable<Station[]> {
    return this.http.get<Station[]>(this.apiUrl);
  }

  // Get station by ID
  getStationById(id: string): Observable<Station> {
    return this.http.get<Station>(`${this.apiUrl}/${id}`);
  }

  // Get station summary
  getStationSummary(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/summary`);
  }

  // Update station
  updateStation(id: string, data: Partial<Station>): Observable<Station> {
    return this.http.patch<Station>(`${this.apiUrl}/${id}`, data);
  }
}
```

## 4. Auth Guard

### Create Guard
```bash
ng generate guard core/guards/auth
```

### `auth.guard.ts`
```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check role-based access if specified in route data
    const requiredRoles = route.data['roles'] as string[];
    if (requiredRoles) {
      const userRole = this.authService.getUserRole();
      if (!userRole || !requiredRoles.includes(userRole)) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}
```

## 5. Login Component

### `login.component.ts`
```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        // Redirect based on role
        const role = this.authService.getUserRole();
        if (role === 'manager') {
          this.router.navigate(['/manager/dashboard']);
        } else if (role === 'director') {
          this.router.navigate(['/director/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Invalid email or password';
        console.error('Login error:', error);
      }
    });
  }
}
```

### `login.component.html`
```html
<div class="login-container">
  <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
    <h2>Login</h2>
    
    <div class="form-group">
      <label for="email">Email</label>
      <input 
        id="email" 
        type="email" 
        formControlName="email"
        placeholder="Enter your email"
      />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input 
        id="password" 
        type="password" 
        formControlName="password"
        placeholder="Enter your password"
      />
    </div>

    <div class="error" *ngIf="errorMessage">
      {{ errorMessage }}
    </div>

    <button type="submit" [disabled]="loginForm.invalid || loading">
      {{ loading ? 'Logging in...' : 'Login' }}
    </button>
  </form>
</div>
```

## 6. Manager Dashboard Component

### `manager-dashboard.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { StationService } from '../../services/station.service';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html'
})
export class ManagerDashboardComponent implements OnInit {
  station: any;
  loading = true;
  error = '';

  constructor(private stationService: StationService) {}

  ngOnInit(): void {
    this.loadMyStation();
  }

  loadMyStation(): void {
    this.stationService.getMyStation().subscribe({
      next: (station) => {
        this.station = station;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load station data';
        this.loading = false;
        console.error('Error loading station:', error);
      }
    });
  }
}
```

### `manager-dashboard.component.html`
```html
<div class="dashboard">
  <h1>My Station Dashboard</h1>

  <div *ngIf="loading">Loading...</div>
  <div *ngIf="error" class="error">{{ error }}</div>

  <div *ngIf="station && !loading" class="station-info">
    <h2>{{ station.name }}</h2>
    <p>{{ station.address }}</p>
    
    <div class="fuel-levels">
      <div class="fuel-card">
        <h3>Petrol</h3>
        <p>Volume: {{ station.petrolVolume }} L</p>
        <p>Price: ₦{{ station.petrolPricePerLitre }}/L</p>
      </div>
      
      <div class="fuel-card">
        <h3>Diesel</h3>
        <p>Volume: {{ station.dieselVolume }} L</p>
        <p>Price: ₦{{ station.dieselPricePerLitre }}/L</p>
      </div>
    </div>
  </div>
</div>
```

## 7. Routing Configuration

### `app.routes.ts`
```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { ManagerDashboardComponent } from './features/manager/dashboard/manager-dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'manager/dashboard', 
    component: ManagerDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['manager'] }
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
```

## 8. Environment Configuration

### `environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

### `environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com'
};
```

Update services to use environment:
```typescript
import { environment } from '../../../environments/environment';

private apiUrl = environment.apiUrl;
```

## Testing the Implementation

1. **Login Flow:**
   ```typescript
   // User enters credentials
   // AuthService sends POST to /auth/login
   // Backend returns { access_token: "..." }
   // Token stored in localStorage
   // User info decoded and stored in BehaviorSubject
   ```

2. **Accessing Protected Endpoint:**
   ```typescript
   // User navigates to manager dashboard
   // AuthGuard checks authentication
   // Component calls stationService.getMyStation()
   // AuthInterceptor adds "Authorization: Bearer <token>" header
   // Backend validates JWT and extracts userId
   // Backend returns station data
   ```

3. **Token Expiration:**
   ```typescript
   // Token expires
   // Backend returns 401 Unauthorized
   // AuthInterceptor catches error
   // User logged out and redirected to login
   ```

## Key Points

- ✅ **No manual userId needed** - JWT token contains it automatically
- ✅ **Interceptor handles all authentication** - No need to add headers manually
- ✅ **Token stored securely** - Use localStorage or sessionStorage
- ✅ **Role-based access control** - Guards check user roles
- ✅ **Automatic logout on 401** - Interceptor handles token expiration

## Common Issues & Solutions

**Issue:** "401 Unauthorized" on protected endpoints
- **Solution:** Ensure token is being sent in Authorization header (check Network tab)

**Issue:** Token not persisting after page refresh
- **Solution:** Call `loadUserFromToken()` in AuthService constructor

**Issue:** CORS errors
- **Solution:** Configure CORS in NestJS backend to allow your Angular origin

**Issue:** Role-based access not working
- **Solution:** Verify JWT payload includes `role` field and guard checks it correctly
