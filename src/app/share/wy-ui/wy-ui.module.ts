import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SingleSheetComponent } from './single-sheet/single-sheet.component';
import { PlayCountPipe } from '../pipes/play-count.pipe';
import { WyPlayerComponent } from './wy-player/wy-player.component';
import { WySliderComponent } from './wy-slider/wy-slider.component';
import { WySliderTrackComponent } from './wy-slider/wy-slider-track.component';
import { WySliderHandleComponent } from './wy-slider/wy-slider-handle.component';
import { FormsModule } from '@angular/forms';
import { FormatTimePipe } from '../pipes/format-time.pipe';
import { WyPlayerPanelComponent } from './wy-player/wy-player-panel/wy-player-panel.component';
import { WyScrollComponent } from './wy-player/wy-scroll/wy-scroll.component';
import { ClickoutsideDirective } from '../directives/clickoutside.directive';


@NgModule({
  declarations: [
    SingleSheetComponent,
    PlayCountPipe,
    WyPlayerComponent,
    WySliderComponent,
    WySliderTrackComponent,
    WySliderHandleComponent,
    FormatTimePipe,
    WyPlayerPanelComponent,
    WyScrollComponent,
    ClickoutsideDirective,
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports:[
    SingleSheetComponent,
    PlayCountPipe,
    WyPlayerComponent,
    WySliderComponent,
    WySliderTrackComponent,
    WySliderHandleComponent,
    FormatTimePipe,
    WyScrollComponent,
    ClickoutsideDirective,
  ]
})
export class WyUiModule { }
