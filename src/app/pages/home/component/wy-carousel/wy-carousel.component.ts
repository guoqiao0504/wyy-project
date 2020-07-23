import { Component, OnInit, ViewChild, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { Injectable,ChangeDetectionStrategy } from '@angular/core';



@Component({
  selector: 'app-wy-carousel',
  templateUrl: './wy-carousel.component.html',
  styleUrls: ['./wy-carousel.component.less'],
  /**
   * 变更检测：angular的变更默认检测默认是一个组件，
   * 发生改变后会把组件树上关联的子组件或者父组件都会重新变更检测一遍
   * OnPush:只会在@Input输入属性发生变化之后组件才会进行变更检测
   * 否则其他组件发生变化后如果不会影响到输入属性组件是不会触发变更检测的
   */
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class WyCarouselComponent implements OnInit {
  /**
   * angular8之后@ViewChild需要传两个参数，会计算模板的查询时间，
  static：变更检测前解析或变更检测后解析，
  如果是动态视图，比如被ngif修饰了static：flase在变更检测之后计算模板的查询时间
  如果并不是动态视图static：true
   */
  @ViewChild('dot', { static: true }) dotRef: TemplateRef<any>;

  @Input() activeIndex = 0

  @Output() changeSlide = new EventEmitter<'pre'| 'next'>();

  constructor() { }

  ngOnInit() {
  }

  onChangeSlide(type:'pre'| 'next'){
    this.changeSlide.emit(type);
  }

}
