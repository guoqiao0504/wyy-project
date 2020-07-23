import { PlayState } from "../reducers/player.reducer";
import { createSelector, createFeatureSelector } from '@ngrx/store';

// 拿到PlayState里面的所有数据
const selectPlayerStates = (state: PlayState) => state;

export const getPlayer = createFeatureSelector<PlayState>('player');
export const getPlaying = createSelector(selectPlayerStates,(state:PlayState)=>state.playing);
export const getPlayList = createSelector(selectPlayerStates,(state:PlayState)=>state.playList);
export const getSongList = createSelector(selectPlayerStates,(state:PlayState)=>state.songList);
export const getPlayMode = createSelector(selectPlayerStates,(state:PlayState)=>state.playMode);
export const getCurrentInde = createSelector(selectPlayerStates,(state:PlayState)=>state.currentIndex);
// 当前播放歌曲
export const getCurrentSong = createSelector(selectPlayerStates,({playList,currentIndex}:PlayState)=>playList[currentIndex]);