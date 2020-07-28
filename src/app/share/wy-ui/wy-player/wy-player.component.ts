import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Inject,
} from "@angular/core";
import { Store, select } from "@ngrx/store";
import { AppStoreModule } from "src/app/store";
import {
  getSongList,
  getPlayList,
  getCurrentInde,
  getPlayer,
  getPlayMode,
  getCurrentSong,
} from "src/app/store/selectors/player.selector";
import { Song } from "src/app/services/date.types/common.types";
import { PlayMode } from "./player-type";
import {
  SetCurrentInde,
  SetPlayMode,
  SetPlayList,
} from "src/app/store/actions/player.actions";
import { Subscription, fromEvent } from "rxjs";
import { DOCUMENT } from "@angular/common";
import { shuffle, findIndex } from "src/app/utils/array";
import { WyPlayerPanelComponent } from "./wy-player-panel/wy-player-panel.component";

const modeTypes: PlayMode[] = [
  {
    type: "loop",
    label: "循环",
  },
  {
    type: "random",
    label: "随机",
  },
  {
    type: "singleLoop",
    label: "单曲循环",
  },
];

@Component({
  selector: "app-wy-player",
  templateUrl: "./wy-player.component.html",
  styleUrls: ["./wy-player.component.less"],
})
export class WyPlayerComponent implements OnInit {
  percent = 0;
  bufferPercent = 0;
  // 保存到播放器变量
  songList: Song[];
  playList: Song[];
  currentIndex: number;
  currentSong: Song;
  // 歌曲总时长
  duration: number;
  // 当前歌曲播放时间
  currentTime: number;

  // 播放状态
  playing = false;

  // 是否可以播放
  songReady = false;

  // 音量
  volume = 60;

  // 是否显示音量面板
  showVolumePanel = false;

  // 是否显示列表面板
  showPanel = false;

  // 绑定windows的click事件
  winClick: Subscription;

  // 是否点击的是音量面板本身
  selfClick = false;

  // 当前模式
  currentMode: PlayMode;

  // 记录播放模式点击次数
  modeCount = 0;

  @ViewChild("audio", { static: true }) private audio: ElementRef;
  @ViewChild(WyPlayerPanelComponent, { static: false })
  private playerPanel: WyPlayerPanelComponent;
  private audioEl: HTMLAudioElement;

  constructor(
    private store$: Store<AppStoreModule>,
    @Inject(DOCUMENT) private doc: Document
  ) {
    const appStore$ = this.store$.pipe(select(getPlayer));
    appStore$
      .pipe(select(getSongList))
      .subscribe((list) => this.watchList(list, "songList"));
    appStore$
      .pipe(select(getPlayList))
      .subscribe((list) => this.watchList(list, "playList"));
    appStore$
      .pipe(select(getCurrentInde))
      .subscribe((index) => this.watchCurrentIndex(index));
    appStore$
      .pipe(select(getPlayMode))
      .subscribe((mode) => this.watchPlayMode(mode));
    appStore$
      .pipe(select(getCurrentSong))
      .subscribe((song) => this.watchCurrentSong(song));
  }

  ngOnInit() {
    this.audioEl = this.audio.nativeElement;
    console.log("audio", this.audio.nativeElement);
    console.log("audioEl", this.audioEl);
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$", this.percent);
    console.log("+++++++++++++++++++++++", this.modeCount);
  }
  watchList(list: Song[], type: string) {
    this[type] = list;
  }
  watchCurrentIndex(index: number) {
    this.currentIndex = index;
  }
  watchPlayMode(mode: PlayMode) {
    console.log("mode", mode);
    this.currentMode = mode;
    if (this.songList) {
      let list = this.songList.slice();
      // 如果是随机模式就把playList数组打乱，在进行播放
      if (mode.type === "random") {
        list = shuffle(this.songList);
        console.log("list", list);
        this.updateCurrentIndex(list, this.currentSong);
        this.store$.dispatch(SetPlayList({ playList: list }));
      }
    }
  }
  updateCurrentIndex(list: Song[], song: Song) {
    const newIndex = findIndex(list, song);
    this.store$.dispatch(SetCurrentInde({ currentIndex: newIndex }));
  }
  watchCurrentSong(song: Song) {
    if (song) {
      this.currentSong = song;
      // 因为当前时长是毫秒，总时长是秒，把总时长变成秒
      this.duration = song.dt / 1000;
      console.log("dwqsadfs", this.currentSong);
    }
  }

  onPercentChange(per) {
    console.log("per", per);
    if (this.currentSong) {
      // 当前播放时长 = 总时长*(per / 100)
      const currentTime = this.duration * (per / 100);
      this.audioEl.currentTime = currentTime;
      if (this.playerPanel) {
        this.playerPanel.seekLyric(currentTime * 1000);
      }
    }
  }

  onCanplay() {
    this.songReady = true;
    this.play();
  }

  play() {
    this.audioEl.play();
    this.playing = true;
  }
  get picUrl(): string {
    return this.currentSong
      ? this.currentSong.al.picUrl
      : "http://p2.music.126.net/PFJv30gvgR9gkVYUOnHnLQ==/109951163998003959.jpg?param=34y34";
  }

  onTimeUpdate(e: Event) {
    this.currentTime = (<HTMLAudioElement>e.target).currentTime;

    this.percent = (this.currentTime / this.duration) * 100;

    const buffered = this.audioEl.buffered;
    if (buffered.length && this.bufferPercent < 100) {
      // 缓冲最后结束的时间 /  总时间  *  100  = 缓冲条
      this.bufferPercent = (buffered.end(0) / this.duration) * 100;
    }
  }

  // 播放暂停
  onToggle() {
    // 如果当前没有正在播放的歌曲但是list里面又有内容的话就播放第一首歌曲
    if (!this.currentSong) {
      if (this.playList.length) {
        this.updateIndex(0);
        this.songReady = false;
      }
    } else {
      if (this.songReady) {
        this.playing = !this.playing;
        if (this.playing) {
          this.audioEl.play();
        } else {
          this.audioEl.pause();
        }
      }
    }
  }

  // 上一曲
  onPrev(index: number) {
    if (!this.songReady) return;
    // 如果当前就只有一首歌曲就单曲循环
    if (this.playList.length === 1) {
      this.loop();
    } else {
      const newIndex = index < 0 ? this.playList.length - 1 : index;
      this.updateIndex(newIndex);
    }
  }

  // 下一曲
  onNext(index: number) {
    if (!this.songReady) return;
    // 如果当前就只有一首歌曲就单曲循环
    if (this.playList.length === 1) {
      this.loop();
    } else {
      const newIndex = index >= this.playList.length ? 0 : index;
      this.updateIndex(newIndex);
    }
  }

  loop() {
    this.audioEl.currentTime = 0;
    this.play();
    if (this.playerPanel) {
      // 重置歌词
      this.playerPanel.seekLyric(0);
    }
  }

  updateIndex(index: number) {
    this.store$.dispatch(SetCurrentInde({ currentIndex: index }));
    this.songReady = false;
  }

  // 控制音量
  onVolumeChange(per: number) {
    this.audioEl.volume = per / 100;
  }

  // 控制音量面板
  togglePanel(type: string) {
    this[type] = !this[type];
    // 如果这个音量面板显示，绑定全局的bindDocumentClickListener
    if (this.showVolumePanel || this.showPanel) {
      this.bindDocumentClickListener();
    } else {
      this.unbindDocumentClickListener();
    }
  }

  bindDocumentClickListener() {
    if (!this.winClick) {
      this.winClick = fromEvent(this.doc, "click").subscribe(() => {
        // 如果不存在，说明点击了播放器以外的部分
        if (!this.selfClick) {
          this.showVolumePanel = false;
          this.showPanel = false;
          this.unbindDocumentClickListener();
        }
        this.selfClick = false;
      });
    }
  }

  unbindDocumentClickListener() {
    if (this.selfClick) {
      this.winClick.unsubscribe();
      this.winClick = null;
    }
  }

  toggleVolPanel() {
    this.togglePanel("showVolumePanel");
  }

  // 控制列表面板
  toggleListPanel() {
    if (this.songList.length) {
      this.togglePanel("showPanel");
    }
  }

  // 改变模式
  changeMode() {
    this.store$.dispatch(
      SetPlayMode({ playMode: modeTypes[++this.modeCount % 3] })
    );
  }

  //播放结束
  onEnded() {
    this.playing = false;
    if (this.currentMode.type === "singleLoop") {
      this.loop();
    } else {
      this.onNext(this.currentIndex + 1);
    }
  }

  // 改变歌曲
  onChangeSong(song: Song) {
    this.updateCurrentIndex(this.playList, song);
  }
}
