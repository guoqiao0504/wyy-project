import { NgModule, SkipSelf, Optional } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServicesModule } from '../services/services.module';
import { PagesModule } from '../pages/pages.module';
import { ShareModule } from '../share/share.module';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { AppStoreModule } from '../store';

registerLocaleData(zh);

@NgModule({
  declarations: [],
  // CoreModule主要负责引入一些一次性引入的模块
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ServicesModule,
    PagesModule,
    ShareModule,
    AppStoreModule,
    AppRoutingModule,
  ],
  exports:[
    ShareModule,
    AppRoutingModule,
  ],
  providers: [{ provide: NZ_I18N, useValue: zh_CN }],
})
export class CoreModule {
  // CoreModule只能被AppModule里引入，所以要在它的构造函数里注入它自己
  // @SkipSelf()装饰器：在查找CoreModule这个类的时候不查找自己，跳过CoreModule文件自身，去父级查找有没有CoreModule
  // @Optional()装饰器：当CoreModule没找到的情况下，就会给parentModule赋值一个null
  constructor(@SkipSelf() @Optional() parentModule: CoreModule){
    // 如果parentModule存在，抛出错误
    if (parentModule) {
      throw new Error('CoreModule只能被AppModule里引入')
    }
  }
}
