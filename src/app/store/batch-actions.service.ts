import { Injectable } from "@angular/core";
import { AppStoreModule } from "./index";
import { Song } from "../services/date.types/common.types";
import { Store, select } from "@ngrx/store";
import { getPlayer } from "./selectors/player.selector";
import {
  SetSongList,
  SetPlayList,
  SetCurrentInde,
} from "./actions/player.actions";
import { PlayState } from "./reducers/player.reducer";
import { findIndex, shuffle } from "../utils/array";
import { NzModalService } from "ng-zorro-antd";

@Injectable({
  providedIn: AppStoreModule,
})
export class BatchActionsService {
  playerState: PlayState;
  constructor(
    private store$: Store<AppStoreModule>,
  ) {
    this.store$
      .pipe(select(getPlayer))
      .subscribe((res) => (this.playerState = res));
  }

  // 播放列表
  selectPlayList({ list, index }: { list: Song[]; index: number }) {
    this.store$.dispatch(SetSongList({ songList: list }));
    let trueIndex = 0;
    let trueList = list.slice();
    if (this.playerState.playMode.type == "random") {
      trueIndex = findIndex(trueList, list[trueIndex]);
      trueList = shuffle(list || []);
    }

    this.store$.dispatch(SetPlayList({ playList: trueList }));
    this.store$.dispatch(SetCurrentInde({ currentIndex: 0 }));
  }

  // 删除歌曲
  DeleteSong(song: Song) {
    const songList = this.playerState.songList.slice();
    const playList = this.playerState.playList.slice();
    let currentIndex = this.playerState.currentIndex;
    const sIndex = findIndex(songList, song);
    songList.splice(sIndex, 1);
    const pIndex = findIndex(playList, song);
    playList.splice(pIndex, 1);
    console.log("pIndex", pIndex, currentIndex);
    if (currentIndex > pIndex || currentIndex === playList.length) {
      console.log("+++++++++++++++++++");
      currentIndex--;
    }

    console.log("-------------------");

    this.store$.dispatch(SetSongList({ songList }));
    this.store$.dispatch(SetPlayList({ playList }));
    this.store$.dispatch(SetCurrentInde({ currentIndex }));
  }
  // 清空歌曲
  ClearSong() {
    this.store$.dispatch(SetSongList({ songList: [] }));
    this.store$.dispatch(SetPlayList({ playList: [] }));
    this.store$.dispatch(SetCurrentInde({ currentIndex: -1 }));
  }
}
