import { Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { WySliderStyle } from './wy-slider-types';

@Component({
  selector: 'app-wy-slider-handle',
  template: `<div class="wy-slider-handle" [ngStyle]="style"></div>`,
  // 变更策略
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class WySliderHandleComponent implements OnInit, OnChanges {
  // 是否垂直模式，默认false：水平
  @Input() wyVertical = false;
  // 滑块移动的距离
  @Input() wyOffset: number;

  style:WySliderStyle = {};
  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    // 当滑块距离发生改变
    if (changes['wyOffset']) {
      // 如果为垂直模式改变bottom属性，为水平模式改变left属性
      this.style[this.wyVertical ? 'bottom' : 'left'] = this.wyOffset + '%';
    }
  }

  ngOnInit() {
  }

}
