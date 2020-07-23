import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Banner, HotTag, SongSheet, Singer } from 'src/app/services/date.types/common.types';
import { Observable, forkJoin } from 'rxjs';
import { HomeService } from 'src/app/services/home.service';
import { SingerService } from 'src/app/services/singer.service';
import { first } from 'rxjs/internal/operators'

type HomeDataType = [Banner[], HotTag[], SongSheet[], Singer[]];

@Injectable({
  providedIn: 'root',
})
export class HomeResolverService implements Resolve<HomeDataType> {
  constructor(
    private homeService: HomeService,
    private singerService: SingerService
  ) { }
  resolve(): Observable<HomeDataType> {
    /**
     * forkJoin：需要多个接口返回值之后才能加载数据渲染页面，此时可以使用forkjoin
     * take(1):forkJoin发出的流取第一个也可以使用first()
     */
    return forkJoin([
      this.homeService.getBanners(),
      this.homeService.getHotTags(),
      this.homeService.getPersonalSheetList(),
      this.singerService.getEnterSinger()
    ]).pipe(first())
  }
}