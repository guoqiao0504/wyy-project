import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ViewChild, ElementRef, Input, Inject, ChangeDetectorRef, OnDestroy, forwardRef, Output, EventEmitter } from '@angular/core';
import { fromEvent, merge, Observable, Subscription } from 'rxjs';
import { filter, tap, pluck, map, distinctUntilChanged, takeUntil } from 'rxjs/internal/operators';
import { SliderEventObserverConfig, SliderValue } from './wy-slider-types';
import { DOCUMENT } from '@angular/common';
import { sliderEvent, getElementOffset } from './wy-slider-helper'
import { inArray } from 'src/app/utils/array';
import { getPercent, limitNumberInRange } from 'src/app/utils/number';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-wy-slider',
  templateUrl: './wy-slider.component.html',
  styleUrls: ['./wy-slider.component.less'],
  /**
   * ShadowDom不进不出，没有样式能进来，组件样式出不去
   * Emulated（默认值） 只进不出，全局样式能进来，组件样式出不去
   * None能进能出
   */
  encapsulation: ViewEncapsulation.None,
  // 变更策略   OnPush策略如果@Input属性不发生变化，组件永远不会发生变更检测
  changeDetection: ChangeDetectionStrategy.OnPush,
  // 要实现自定义表单控件需要注入token  ：  NG_VALUE_ACCESSOR
  providers: [{
    /**
     * NG_VALUE_ACCESSOR：token类型为ControlValueAccessor，
     * 将控件本身注册到DI框架成为一个可以让表单访问其值的控件
     * 
     * NG_VALIDATORS：将控件注册成为一个可以让表单得到其验证状态的控件，
     * NG_VALIDATORS的token类型为function或Validator，配合useExisting，
     * 可以让控件只暴露对应的function或Validator的validate方法。
     * 针对token为Validator类型来说，控件实现了validate方法就可以实现表单控件验证
     * 
     * 
     * forwardRef：允许我们引用一个尚未定义的类
     * 
     * multi：设为true，表示这个token对应多个依赖项，使用相同的token去获取依赖项的时候，获取的是已注册的依赖对象列表。'
     * 如果不设置multi为true，那么对于相同token的提供商来说，后定义的提供商会覆盖前面已定义的提供商
     */
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => WySliderComponent),
    multi: true
  }]
})
//要实现ng-zorro中NgMode指令 所以要实现ControlValueAccessor自定义表单控件接口
export class WySliderComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('wySlider', { static: true }) private wySlider: ElementRef;
  // 水平，垂直模式  默认false：水平
  @Input() wyVertical = false;
  @Input() wyMin = 0;
  @Input() wyMax = 100;
  @Input() bufferOffset:SliderValue = 0;

  @Output() wyOnAfterChange = new EventEmitter<SliderValue>();

  private sliderDom: HTMLDivElement;

  // 绑定流
  private dragStrat$: Observable<number>;
  private dragMove$: Observable<number>;
  private dragEnd$: Observable<Event>;
  // 解绑
  private dragStrat_: Subscription | null;
  private dragMove_: Subscription | null;
  private dragEnd_: Subscription | null;

  // 是否正在滑动
  private isDragging = false;

  value: SliderValue = null;
  offset: SliderValue = null;
  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private cdr: ChangeDetectorRef
  ) { }


    // 组件内部通过拖拽改变值之后需要把事件发射出去
  onValueChange(value: SliderValue): void { }
  onTouched(): void { }


  // 复制,将新值新值写入视图或dom属性中
  writeValue(value: SliderValue): void {
    this.setValue(value, true);
  }
// 设置当控件接收到 change 事件后，调用的函数，可以用来通知外部，组件已经发生变化
  registerOnChange(fn: (value: SliderValue) => void): void {
    this.onValueChange = fn;
  }
  // 设置当控件接收到 touched 事件后，调用的函数
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  // 组件被销毁时解绑
  ngOnDestroy(): void {
    this.unsubscribeDrag();
  }

  ngOnInit() {
    this.sliderDom = this.wySlider.nativeElement
    this.createDraggingObservables()
    this.subscribeDrag(['start']);
  }
  createDraggingObservables() {
    // 如果是垂直模式pageY，否则：pageX
    const orientField = this.wyVertical ? 'pageY' : 'pageX';
    // pc滑块事件
    const mouse: SliderEventObserverConfig = {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseup',
      filter: (e: MouseEvent) => e instanceof MouseEvent,
      // event.pageX || event.pageY
      pluckKey: [orientField]
    };
    // 手机滑块事件
    const touch: SliderEventObserverConfig = {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend',
      filter: (e: TouchEvent) => e instanceof TouchEvent,
      // event.touchs[0].pageX  || event.touchs[0].pageY
      pluckKey: ['touchs', '0', orientField]
    };

    [mouse, touch].forEach(source => {
      const { start, move, end, filter: filerFunc, pluckKey } = source;
      /**
       *  fromEvent：将一个元素上的事件转化为一个Observable
       * filter():筛选，如果是pc端筛选出MouseEvent，如果是移动端筛选出TouchEvent
       * tap():中间调试拦截阻止冒泡和默认事件
       * pluck()获取当前按下的位置
       * ... :用在数组前面，可以把数组的值全部打散，展开，叫展开运算符. 
       * 语法格式: 在数组面前加三个点( ... )
       */
      source.startPlucked$ = fromEvent(this.sliderDom, start)
        .pipe(
          filter(filerFunc),
          tap(sliderEvent),
          pluck(...pluckKey),
          map((position: number) => this.findClosestValue(position))
        );
      source.end$ = fromEvent(this.doc, end);
      source.moveResolved$ = fromEvent(this.doc, move)
        .pipe(
          filter(filerFunc),
          tap(sliderEvent),
          pluck(...pluckKey),
          // distinctUntilChanged当值发生改变的话，就继续往下发射流
          distinctUntilChanged(),
          // 位置和值做转换，根据位置算出值
          map((position: number) => this.findClosestValue(position)),
          takeUntil(source.end$)
        )
    })
    // merge 成对的事件用merge操作符合并方便订阅
    this.dragStrat$ = merge(mouse.startPlucked$, touch.startPlucked$);
    this.dragMove$ = merge(mouse.moveResolved$, touch.moveResolved$);
    this.dragEnd$ = merge(mouse.end$, touch.end$);
  }

  // 订阅事件
  subscribeDrag(events: string[] = ['start', 'move', 'end']) {
    // 如果参数带有start并且this.dragStrat$存在，就订阅start事件
    if (inArray(events, 'start') && this.dragStrat$ && !this.dragStrat_) {
      this.dragStrat_ = this.dragStrat$.subscribe(this.onDragStart.bind(this));
    }
    if (inArray(events, 'move') && this.dragMove$ && !this.dragMove_) {
      this.dragMove_ = this.dragMove$.subscribe(this.onDragMove.bind(this));
    }
    if (inArray(events, 'end') && this.dragEnd$ && !this.dragEnd_) {
      this.dragEnd_ = this.dragEnd$.subscribe(this.onDragEnd.bind(this));
    }
  }
  // 解绑
  unsubscribeDrag(events: string[] = ['start', 'move', 'end']) {
    if (inArray(events, 'start') && this.dragStrat_) {
      this.dragStrat_.unsubscribe();
      this.dragStrat_ = null;
    }
    if (inArray(events, 'move') && this.dragMove_) {
      this.dragMove_.unsubscribe();
      this.dragMove_ = null;
    }
    if (inArray(events, 'end') && this.dragEnd_) {
      this.dragEnd_.unsubscribe();
      this.dragEnd_ = null;
    }
  }

  onDragStart(value: number) {
    this.toggleDragMoving(true);
    this.setValue(value);
    console.log("value",value);
  }

  onDragMove(value: number) {
    if (this.isDragging) {
      this.setValue(value);
      // 因为value属性不会发生改变所以需要手动进行变更检测
      this.cdr.markForCheck();
    }
  }
// 鼠标抬起的时候
  onDragEnd() {
    this.wyOnAfterChange.emit(this.value);
    this.toggleDragMoving(false);
    this.cdr.markForCheck();
  }
  // 绑定或解绑事件
  toggleDragMoving(movable: boolean) {
    this.isDragging = movable;
    if (movable) {
      //  绑定move和end事件
      this.subscribeDrag(['move', 'end'])
    } else {
      this.unsubscribeDrag(['move', 'end'])
    }
  }

  findClosestValue(position: number): number {
    // 获取滑块总长
    const sliderLength = this.getSliderLength();
    // 滑块左端点或上端点位置
    const sliderStart = this.getSliderStartPosition();
    // 滑块当前位置 / 滑块总长
    const ratio = limitNumberInRange((position - sliderStart) / sliderLength, 0, 1);
    // 如果是垂直模式的话1 - ratio，否则ratio
    const ratioTrue = this.wyVertical ? 1 - ratio : ratio;
    return ratioTrue * (this.wyMax - this.wyMin) + this.wyMin;
  }

  getSliderLength(): number {
    // 如果是垂直就返回this.sliderDom.clientHeight，否则this.sliderDom.clientWidth
    return this.wyVertical ? this.sliderDom.clientHeight : this.sliderDom.clientWidth;
  }

  getSliderStartPosition(): number {
    const offset = getElementOffset(this.sliderDom);
    //  如果是垂直就返回offset.top，否则offset.left
    return this.wyVertical ? offset.top : offset.left;
  }

  setValue(value: SliderValue, needCheck = false) {
    if (needCheck) {
      if (this.isDragging) return;
      // 通过formatValue把不合法的值变成合法的值
      this.value = this.formatValue(value);
      this.updateTrackAndHandles();
    }
    if (!this.valuesEqual(this.value, value)) {
      this.value = value;
      this.updateTrackAndHandles();
      this.onValueChange(this.value);
    }

  }

  formatValue(value: SliderValue): SliderValue {
    let res = value;
    // 判断是否是数字
    if (!this.assertValueValid(value)) {
      res = this.wyMin;
    }else{
      res = limitNumberInRange(value,this.wyMin,this.wyMax);
    }
    return res;
  }

  // 判断是否是NAN
  assertValueValid(value: SliderValue): boolean {
    return isNaN(typeof value !== 'number' ? parseFloat(value) : value)
  }
  valuesEqual(valA: SliderValue, valB: SliderValue): boolean {
    if (typeof valA !== typeof valB) {
      return false;
    }
    return valA === valB;
  }
  updateTrackAndHandles() {
    this.offset = this.getValeToOffset(this.value);
    this.cdr.markForCheck();
  }

  getValeToOffset(value: SliderValue): SliderValue {
    return getPercent(this.wyMin, this.wyMax, value)
  }
}
