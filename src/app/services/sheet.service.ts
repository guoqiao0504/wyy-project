import { ServicesModule, API_CONFIG } from "./services.module";
import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { SongSheet, Song, SheetList } from "./date.types/common.types";
import { Observable } from "rxjs";
import { map, pluck, switchMap } from "rxjs/internal/operators";
import { SongService } from "./song.service";
import queryString from "query-string";

export type SheetParams = {
  offset: number; //分页
  limit: number; //评论数量，默认为50
  order: "new" | "hot";
  cat: string;
};

@Injectable({
  // providedIn：HomeService是哪个模块提供的
  // 'root'默认是app.module提供的，ServicesModule表示是ServicesModule提供的
  providedIn: ServicesModule,
})
export class SheetService {
  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private url: string,
    private songService: SongService
  ) {}
  // 获取歌单详情
  getSongSheetDetail(id: number): Observable<SongSheet> {
    const params = new HttpParams().set("id", id.toString());
    return this.http
      .get(this.url + "playlist/detail", { params })
      .pipe(map((res: { playlist: SongSheet }) => res.playlist));
  }

  playSheet(id: number): Observable<Song[]> {
    // pluck属性筛选
    return this.getSongSheetDetail(id).pipe(
      pluck("tracks"),
      switchMap((tracks) => this.songService.getSongList(tracks))
    );
  }

  // 获取歌单列表
  getSheets(args: SheetParams): Observable<SheetList> {
    const params = new HttpParams({ fromString: queryString.stringify(args) });
    return this.http
      .get(this.url + "top/playlist", { params })
      .pipe(map((res) => res as SheetList));
  }
}
