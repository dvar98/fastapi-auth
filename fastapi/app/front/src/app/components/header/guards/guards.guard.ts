import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { UserAuthService } from 'src/app/services/user-auth.service';

export const guardsGuard: CanActivateFn = (route:ActivatedRouteSnapshot, 
  state:RouterStateSnapshot) => {

    const userauthService = inject(UserAuthService);
    const router = inject(Router);

    userauthService.isLoggedIn || router.navigate(["inicio-sesion"]);

  return true;
};
