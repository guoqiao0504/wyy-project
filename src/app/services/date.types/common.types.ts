// 轮播图
export type Banner = {
  targetId: number;
  url: string;
  imageUrl: string;
};
// 热门标签
export type HotTag = {
  id: number;
  name: string;
  position: number;
};

// 歌手
export type Singer = {
  id: number;
  name: string;
  /**图片 */
  picUrl: string;
  /**专辑数 */
  albumSize: number;
};

// 歌曲
export type Song = {
  id: number;
  name: string;
  url: string;
  //歌手
  ar: Singer[];
  al: { id: number; name: string; picUrl: string };
  dt: number;
};

// 推荐歌单
export type SongSheet = {
  id: number;
  name: string;
  /**播放量 */
  playCount: number;
  /**图片 */
  picUrl: string;
  coverImgUrl:string;
  // 歌曲
  tracks: Song[];
};

// 歌曲播放地址
export type SongUrl = {
  id: number;
  url: string;
};

// 获取歌词
export type Lyric = {
  lyric: string;
  tlyric: string;
};

// 歌单列表
export type SheetList = {
    playlists:SongSheet[];
    total:number;
};
