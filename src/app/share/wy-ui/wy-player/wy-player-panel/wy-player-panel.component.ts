import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
  Inject,
} from "@angular/core";
import { Song } from "src/app/services/date.types/common.types";
import { WyScrollComponent } from "../wy-scroll/wy-scroll.component";
import { findIndex } from "src/app/utils/array";
import { timer } from "rxjs";
import { WINDOW } from "src/app/services/services.module";
import { SongService } from "src/app/services/song.service";
import { WyLyric, BaseLyricLine } from "./wy-lyric";

@Component({
  selector: "app-wy-player-panel",
  templateUrl: "./wy-player-panel.component.html",
  styleUrls: ["./wy-player-panel.component.less"],
})
export class WyPlayerPanelComponent implements OnInit, OnChanges {
  @Input() playing: boolean;
  @Input() songList: Song[];
  @Input() currentSong: Song;
  currentIndex: number;
  @Input() show: boolean;

  @Output() onClose = new EventEmitter<void>();
  @Output() onChangeSong = new EventEmitter<Song>();
  @Output() onDeleteSong = new EventEmitter<Song>();
  @Output() onClearSong = new EventEmitter<void>();

  @ViewChildren(WyScrollComponent) private wyScroll: QueryList<
    WyScrollComponent
  >;

  scrollY = 0;

  currentLyric: BaseLyricLine[];

  lyric: WyLyric;

  currentLineNum: number;

  lyricRefs: NodeList;

  startLine = 3;
  constructor(
    // @Inject(WINDOW) private win:Window
    private songService: SongService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    // playing状态发生改变
    if (changes["playing"]) {
      // 如果不是第一次改变
      if (!changes["playing"].firstChange) {
        this.lyric && this.lyric.togglePlay(this.playing);
      }
    }
    if (changes["songList"]) {
      this.updateCurrentIndex();
    }
    if (changes["currentSong"]) {
      console.log("currentSong", this.currentSong);
      if (this.currentSong) {
        this.currentIndex = findIndex(this.songList, this.currentSong);
        this.updateLyric();
        if (this.show) {
          this.scrollToCurrent();
        }
      } else {
        this.resetLyric();
      }
    }
    if (changes["show"]) {
      if (!changes["show"].firstChange && this.show) {
        // 如果有多个better-scroll 组件 .fitst 就是第一个
        this.wyScroll.first.refreshScroll();
        this.wyScroll.last.refreshScroll();
        console.log("------------------------", this.wyScroll);
        timer(80).subscribe(() => {
          if (this.currentSong) {
            this.scrollToCurrent(0);
          }
          if (this.lyricRefs) {
            this.scrollToCurrentLyric(0);
          }
        });
        // this.win.setTimeout(() => {
        //   if (this.currentSong) {
        //     this.scrollToCurrent(0);
        //   }
        // }, 80)
      }
    }
  }

  updateCurrentIndex() {
    this.currentIndex = findIndex(this.songList, this.currentSong);
  }

  scrollToCurrent(speed = 300) {
    const songListRefs = this.wyScroll.first.el.nativeElement.querySelectorAll(
      "ul li"
    );
    if (songListRefs.length) {
      const currentLi = songListRefs[this.currentIndex || 0];
      const offsetTop = currentLi.offsetTop;
      const offsetHeight = currentLi.offsetHeight;
      console.log("scrollY", this.scrollY);
      console.log("offsetTop", offsetTop);
      console.log("offsetHeight", offsetHeight);
      if (
        offsetTop - Math.abs(this.scrollY) > offsetHeight * 7 ||
        offsetTop < Math.abs(this.scrollY)
      ) {
        this.wyScroll.first.scrollToElement(currentLi, speed, false, false);
      }
    }
  }

  scrollToCurrentLyric(speed = 300) {
    const targetLine = this.lyricRefs[this.currentLineNum - this.startLine];
    if (targetLine) {
      this.wyScroll.last.scrollToElement(targetLine, speed, false, false);
    }
  }

  updateLyric() {
    this.resetLyric();
    this.songService.getLyric(this.currentSong.id).subscribe((res) => {
      console.log("歌词", res);
      this.lyric = new WyLyric(res);
      this.currentLyric = this.lyric.lines;
      console.log("==============", this.currentLyric);
      this.startLine = res.tlyric ? 1 : 3;
      this.handleLyric();
      // 切歌后把歌词重置到最顶部
      this.wyScroll.last.scrollTo(0, 0);
      // 如果当前是播放状态，歌词跟着播放
      if (this.playing) {
        this.lyric.play();
      }
    });
  }

  handleLyric() {
    this.lyric.handler.subscribe(({ lineNum }) => {
      console.log("lineNum", lineNum);
      if (!this.lyricRefs) {
        this.lyricRefs = this.wyScroll.last.el.nativeElement.querySelectorAll(
          "ul>li"
        );
        console.log("lyricRefs", this.lyricRefs);
      }

      if (this.lyricRefs.length) {
        this.currentLineNum = lineNum;
        console.log("lineNum,startLine:", lineNum + "-----------" + this.startLine);
        if (lineNum > this.startLine) {
          this.scrollToCurrentLyric(300);
        } else {
          this.wyScroll.last.scrollTo(0, 0);
        }
      }
    });
  }

  // 重置歌词lyric
  resetLyric() {
    if (this.lyric) {
      this.lyric.stop();
      this.lyric = null;
      this.currentLyric = [];
      this.currentLineNum = 0;
      this.lyricRefs = null;
    }
  }

  seekLyric(time: number) {
    if (this.lyric) {
      this.lyric.seek(time);
    }
  }
  ngOnInit() {}
}
