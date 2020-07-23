import { Injectable, Inject } from '@angular/core';
import { ServicesModule, API_CONFIG } from './services.module';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Banner, HotTag, SongSheet } from './date.types/common.types';
import { map } from 'rxjs/internal/operators';

@Injectable({
  // providedIn：HomeService是哪个模块提供的
  // 'root'默认是app.module提供的，ServicesModule表示是ServicesModule提供的
  providedIn: ServicesModule
})
export class HomeService {

  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private url: string
  ) { }
  // 获取轮播图
  getBanners(): Observable<Banner[]> {
    return this.http.get(this.url + 'banner')
      .pipe(map((res: { banners: Banner[] }) => res.banners));
  }
  // 获取热门歌单分类
  getHotTags(): Observable<HotTag[]> {
    return this.http.get(this.url + 'playlist/hot')
      .pipe(map((res: { tags: HotTag[] }) => {
        return res.tags.sort((x: HotTag, y: HotTag) => {
          return x.position - y.position
        }).slice(0, 5)
      }));
  }
  // 获取推荐歌单
  getPersonalSheetList(): Observable<SongSheet[]> {
    return this.http.get(this.url + 'personalized')
      // slice(0,16)截取0-16条数据
      .pipe(map((res: { result: SongSheet[] }) => res.result.slice(0, 16)));
  }
}
