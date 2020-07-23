import { NgModule, InjectionToken, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
// 网易登录令牌
export const API_CONFIG = new InjectionToken('ApiConfigToken');

// 封装window的令牌
export const WINDOW = new InjectionToken('WindowToken');

@NgModule({
  declarations: [],
  imports: [
    // ServicesModule主要负责引入一些服务模块
  ],
  providers: [
    { provide: API_CONFIG, useValue: 'http://localhost:3000/' },
    {
      provide: WINDOW,
      useFactory(platformId: Object): Window | Object {
        return isPlatformBrowser(platformId) ? window : {};
      },
      deps:[PLATFORM_ID]
    }
  ]
})
export class ServicesModule { }
