import { PlayMode } from 'src/app/share/wy-ui/wy-player/player-type';
import { Song } from 'src/app/services/date.types/common.types';
import { createReducer, on, Action } from '@ngrx/store';
import { SetPlaying, SetPlayList, SetSongList, SetCurrentInde, SetPlayMode } from '../actions/player.actions';

// 定义播放器类型
export type PlayState = {
    // 播放状态
    playing: boolean;
    // 播放模式
    playMode: PlayMode;
    // 歌曲列表
    songList: Song[];
    // 播放列表
    playList: Song[],
    // 当前正在播放的索引
    currentIndex: number;
}
// 初始数据
export const initialState: PlayState = {
    playing: false,
    songList: [],
    playList: [],
    playMode: { type: 'loop', label: '循环' },
    // 并不知道默认会播放哪一首歌
    currentIndex: -1
}


// on()注册一系列事件的动作
const reducer = createReducer(
    initialState,
    // 执行SetPlaying动作之后，修改state数据，返回一个新的state状态
    on(SetPlaying, (state, { playing }) => ({ ...state, playing })),
    on(SetPlayList, (state, { playList }) => ({ ...state, playList})),
    on(SetSongList, (state, { songList }) => ({ ...state, songList })),
    on(SetPlayMode, (state, { playMode }) => ({ ...state, playMode})),
    on(SetCurrentInde, (state, { currentIndex }) => ({ ...state, currentIndex })),
)

export function playerReducer(state:PlayState,action:Action){
    return reducer(state,action);
}