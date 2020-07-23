import { Injectable, Inject } from '@angular/core';
import { ServicesModule, API_CONFIG } from './services.module';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/internal/operators';
import { Singer } from './date.types/common.types';
import queryString from 'query-string';

type SingerParams = {
  /**分页 */
  offset: number;
  /**每页条数 */
  limit: number;
  /**歌手类型 */
  cat?: string;
}

const defaltParams: SingerParams = {
  offset: 0,
  limit: 9,
  cat: '5001'
}

@Injectable({
  // providedIn：HomeService是哪个模块提供的
  // 'root'默认是app.module提供的，ServicesModule表示是ServicesModule提供的
  providedIn: ServicesModule
})
export class SingerService {

  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private url: string
  ) { }
  // 获取轮播图
  getEnterSinger(args: SingerParams = defaltParams): Observable<Singer[]> {
    const params = new HttpParams({ fromString: queryString.stringify(args) })
    return this.http.get(this.url + 'artist/list', { params })
      .pipe(map((res: { artists: Singer[] }) => res.artists));
  }
}
