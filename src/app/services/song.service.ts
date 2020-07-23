import { ServicesModule, API_CONFIG } from './services.module';
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SongUrl, Song, Lyric } from './date.types/common.types';
import { Observable, observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';

@Injectable({
  // providedIn：HomeService是哪个模块提供的
  // 'root'默认是app.module提供的，ServicesModule表示是ServicesModule提供的
  providedIn: ServicesModule
})
export class SongService {

  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private url: string
  ) { }
  // 获取歌单详情
  getSongUrl(ids: string): Observable<SongUrl[]> {
    const params = new HttpParams().set('id', ids);
    return this.http.get(this.url + 'song/url', { params })
      .pipe(map((res: { data: SongUrl[] }) => res.data));
  }
  // getSongList(songs: Song | Song[]): Observable<Song[]> {
  //   // 判断是否是数组，如果是数组直接等于song，如果不是数组就把它变成数组
  //   const songArr = Array.isArray(songs) ? songs.slice() : [songs];
  //   // 把歌曲id组成字符串
  //   const ids = songArr.map(item => item.id).join(',');
  //   return Observable.create(observable => {
  //     this.getSongUrl(ids).subscribe(urls => {
  //       // next()可以让外面拿到数据
  //       observable.next(this.generateSongList(songArr, urls));
  //     })
  //   })
  // }

  getSongList(songs: Song | Song[]): Observable<Song[]> {
    // 判断是否是数组，如果是数组直接等于song，如果不是数组就把它变成数组
    const songArr = Array.isArray(songs) ? songs.slice() : [songs];
    // 把歌曲id组成字符串
    const ids = songArr.map(item => item.id).join(',');
    return this.getSongUrl(ids).pipe(map(urls => this.generateSongList(songArr, urls)));
  }

  private generateSongList(songs: Song[], urls: SongUrl[]): Song[] {
    const result = [];
    songs.forEach(song => {
      const url = urls.find(url => url.id === song.id).url;
      if (url) {
        result.push({ ...song, url })
      }
    });
    return result;
  }


  // 获取歌词
  getLyric(id: number): Observable<Lyric> {
    const params = new HttpParams().set("id", id.toString());
    return this.http.get(this.url + 'lyric', { params }).pipe(map((res: { [key: string]: { lyric: string } }) => {
     console.log("@@@@@@@@@@@@@",res)
      return {
        lyric: res.lrc.lyric,
        tlyric: res.tlyric.lyric,

      }
    }))
  }
}
