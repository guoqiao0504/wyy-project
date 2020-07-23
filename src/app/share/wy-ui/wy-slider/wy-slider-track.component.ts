import { Component, OnInit, Input, SimpleChanges, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { WySliderStyle } from './wy-slider-types';

@Component({
  selector: 'app-wy-slider-track',
  template: '<div class="wy-slider-track" [class.buffer]="wyBuffer" [ngStyle]="style"></div>',
  // 变更策略
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class WySliderTrackComponent implements OnInit, OnChanges {
  // 是否垂直模式，默认false：水平
  @Input() wyVertical = false;
  // 滑块移动的距离
  @Input() wyLength: number;
  // 缓冲条
  @Input() wyBuffer: false;
  style:WySliderStyle = {}
  constructor() { }

  ngOnInit() {
  }
  // 监听wyLength，当wyLength不断改变的时候，就要改变水平或垂直的width或height
  ngOnChanges(changes: SimpleChanges): void {
    // 当滑块距离发生改变
    if (changes['wyLength']) {
      // 如果是垂直的话，改变height
      if (this.wyVertical) {
        this.style.height = this.wyLength + '%';
        this.style.left = null;
        this.style.width = null;
      } else {
        this.style.width = this.wyLength + '%';
        this.style.bottom = null;
        this.style.height = null;
      }
    }
  }
}
