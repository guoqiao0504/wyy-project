import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { WyUiModule } from './wy-ui/wy-ui.module';
import { PlayCountPipe } from './pipes/play-count.pipe';
import { ClickoutsideDirective } from './directives/clickoutside.directive';



@NgModule({
  imports: [
    // ShareModule主要负责引入公共的模块，组件、指令，导入并导出
    CommonModule,
    NgZorroAntdModule,
    FormsModule,
    WyUiModule
  ],
  exports:[
    CommonModule,
    NgZorroAntdModule,
    FormsModule,
    WyUiModule,
    PlayCountPipe,
    ClickoutsideDirective
  ]
})
export class ShareModule { }
