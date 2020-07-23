import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ViewChildren, QueryList, ElementRef, Inject } from '@angular/core';
import { Song } from 'src/app/services/date.types/common.types';
import { WyScrollComponent } from '../wy-scroll/wy-scroll.component';
import { findIndex } from 'src/app/utils/array';
import { timer } from 'rxjs';
import { WINDOW } from 'src/app/services/services.module';
import { SongService } from 'src/app/services/song.service';
import { WyLyric, BaseLyricLine } from './wy-lyric';

@Component({
  selector: 'app-wy-player-panel',
  templateUrl: './wy-player-panel.component.html',
  styleUrls: ['./wy-player-panel.component.less']
})
export class WyPlayerPanelComponent implements OnInit, OnChanges {
  @Input() playing: boolean;
  @Input() songList: Song[];
  @Input() currentSong: Song;
  currentIndex: number;
  @Input() show: boolean;

  @Output() onClose = new EventEmitter<void>();
  @Output() onChangeSong = new EventEmitter<Song>();

  @ViewChildren(WyScrollComponent) private wyScroll: QueryList<WyScrollComponent>;

  scrollY = 0;

  currentLyric:BaseLyricLine[];

  lyric:WyLyric;

  constructor(
    // @Inject(WINDOW) private win:Window
    private songService: SongService
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['playing']){
      if (changes['playing'].firstChange&&this.playing) {
       this.lyric.play(); 
      }
    }
    if (changes['songList']) {
      console.log('songList', this.songList);
      this.currentIndex = 0;
    }
    if (changes['currentSong']) {
      console.log('currentSong', this.currentSong);
      if (this.currentSong) {
        this.currentIndex = findIndex(this.songList, this.currentSong);
        this.updateLyric();
        if (this.show) {
          this.scrollToCurrent();
        }
      }
    }
    if (changes['show']) {
      if (!changes['show'].firstChange && this.show) {
        // 如果有多个better-scroll 组件 .fitst 就是第一个
        this.wyScroll.first.refreshScroll();
        this.wyScroll.last.refreshScroll();
        console.log('------------------------', this.wyScroll);
        timer(80).subscribe(() => {
          if (this.currentSong) {
            this.scrollToCurrent(0);
          }
        })
        // this.win.setTimeout(() => {
        //   if (this.currentSong) {
        //     this.scrollToCurrent(0);
        //   }
        // }, 80)

      }
    }
  }

  scrollToCurrent(speed = 300) {
    const songListRefs = this.wyScroll.first.el.nativeElement.querySelectorAll('ul li');
    if (songListRefs.length) {
      const currentLi = songListRefs[this.currentIndex || 0];
      const offsetTop = currentLi.offsetTop;
      const offsetHeight = currentLi.offsetHeight;
      console.log('scrollY', this.scrollY);
      console.log('offsetTop', offsetTop);
      console.log('offsetHeight', offsetHeight);
      if ((offsetTop - Math.abs(this.scrollY) > offsetHeight * 7) || (offsetTop < Math.abs(this.scrollY))) {
        this.wyScroll.first.scrollToElement(currentLi, speed, false, false);
      }
    }
  }

  updateLyric() {
    this.songService.getLyric(this.currentSong.id).subscribe(res => {
      console.log("歌词", res);
      this.lyric = new WyLyric(res);
      this.currentLyric = this.lyric.lines;
      console.log('==============',this.currentLyric);
      // 切歌后把歌词重置到最顶部
      this.wyScroll.last.scrollTo(0,0);
      // 如果当前是播放状态，歌词跟着播放
      if (this.playing) {
        this.lyric.play();
      }
    })
  }
  ngOnInit() {
  }

}
