import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, Inject } from '@angular/core';
import BScroll from '@better-scroll/core';
import ScrollBar from '@better-scroll/scroll-bar';
import MouseWheel from '@better-scroll/mouse-wheel';
import { timer } from 'rxjs';
import { WINDOW } from 'src/app/services/services.module';
BScroll.use(MouseWheel);
BScroll.use(ScrollBar);

@Component({
  selector: 'app-wy-scroll',
  template: `<div class="wy-scroll" #wrap>
  <ng-content></ng-content>
  </div> `,
  styles: [`.wy-scroll{width:100%;height:100%;overflow:hidden;}`],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyScrollComponent implements OnInit, AfterViewInit, OnChanges {
  private bs: BScroll;

  @Input() refreshDelay = 50;
  @Input() data: any[];
  @ViewChild('wrap', { static: true }) private wrapRef: ElementRef;

  @Output() onScrollEnd = new EventEmitter<number>();
  constructor(
    readonly el:ElementRef,
    // @Inject(WINDOW) private win:Window
    ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.refreshScroll();
    }
  }
  ngAfterViewInit(): void {
    this.bs = new BScroll(this.wrapRef.nativeElement, {
      scrollbar: {
        interactive: true
      },
      mouseWheel:{}
    });
    this.bs.on('scrollEnd',({y})=>this.onScrollEnd.emit(y))
  }

  ngOnInit() {
  }

  refresh() {
    this.bs.refresh();
    console.log('?????????????????????')
  }
  refreshScroll() {
    timer(this.refreshDelay).subscribe(()=>{
      this.refresh();
    })
    // this.win.setTimeout(()=>{
    //   this.refresh()
    // },this.refreshDelay)
  
  }

  scrollToElement(...args){
    this.bs.scrollToElement.apply(this.bs,args);
  }

  scrollTo(...args){
    this.bs.scrollTo.apply(this.bs,args);
  }
}
