import { Component, OnInit, ViewChild } from '@angular/core';
import { Banner, HotTag, SongSheet, Singer } from 'src/app/services/date.types/common.types';
import { NzCarouselComponent } from 'ng-zorro-antd';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/internal/operators';
import { SheetService } from '../../services/sheet.service';
import { Store, select } from '@ngrx/store';
import { AppStoreModule } from 'src/app/store';
import { SetSongList, SetPlayList, SetCurrentInde } from '../../store/actions/player.actions';
import { PlayState } from 'src/app/store/reducers/player.reducer';
import { getPlayer } from 'src/app/store/selectors/player.selector';
import { findIndex, shuffle } from 'src/app/utils/array';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  banners: Banner[];
  hotTags: HotTag[];
  songSheetList: SongSheet[];
  carouselActiveIndex = 0
  /**保存singer数据 */
  singers: Singer[];

  playerState: PlayState

  @ViewChild(NzCarouselComponent, { static: true }) private nzCarousel: NzCarouselComponent;
  constructor(
    private router: ActivatedRoute,
    private sheetService: SheetService,
    private store$: Store<AppStoreModule>
  ) {
    // data是一个Observable对象，包含路由配置的数据：homerouting文件的data和resolve
    this.router.data.pipe(map(res => res.homeDatas)).subscribe(([banners, hotTags, songSheetList, singers]) => {
      //  轮播图
      this.banners = banners;
      // 热门歌单
      this.hotTags = hotTags;
      // 推荐歌单
      this.songSheetList = songSheetList;
      // 入驻歌手
      this.singers = singers
    })

    this.store$.pipe(select(getPlayer)).subscribe(res => this.playerState = res)
  }

  ngOnInit() {
  }
  onBeforeChange({ to }) {
    this.carouselActiveIndex = to;
  }
  onChangeSlide(type: 'pre' | 'next') {
    this.nzCarousel[type]();
  }
  // 播放歌单事件
  onPlaySheet(id: number) {
    console.log('id', id)
    this.sheetService.playSheet(id).subscribe(list => {
      this.store$.dispatch(SetSongList({ songList: list }));
      let trueIndex = 0;
      let trueList = list.slice();
      if (this.playerState.playMode.type == "random") {
        trueIndex = findIndex(trueList, list[trueIndex]);
        trueList = shuffle(list || []);
      }


      this.store$.dispatch(SetPlayList({ playList: trueList }));
      this.store$.dispatch(SetCurrentInde({ currentIndex: 0 }))
    })
  }
}
