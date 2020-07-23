import { createAction, props } from '@ngrx/store';
import { Song } from 'src/app/services/date.types/common.types';
import { PlayMode } from 'src/app/share/wy-ui/wy-player/player-type';

// 设置播放状态
/**
 * 第一个参数：字符串的标识符，用于语义化这个动作是用来干吗
 * [player] set playing:在player模块下设置播放状态
 */
export const SetPlaying = createAction('[player] set playing', props<{ playing: boolean }>());
export const SetPlayList = createAction('[player] set playList', props<{ playList: Song[] }>());
export const SetSongList = createAction('[player] set songList', props<{ songList: Song[] }>());
export const SetPlayMode = createAction('[player] set playMode', props<{ playMode: PlayMode }>());
export const SetCurrentInde = createAction('[player] set currentIndex', props<{ currentIndex: number }>());