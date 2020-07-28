import { Lyric } from "src/app/services/date.types/common.types";
import { skip, delay, timeout } from "rxjs/internal/operators";
import { from, zip, Subject, Subscription, timer } from "rxjs";

// [03:16.630]
const timeExp = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/;

export interface BaseLyricLine {
  txt: string;
  txtCn: string;
}

interface LyricLine extends BaseLyricLine {
  time: number;
}
interface Handler extends BaseLyricLine {
  lineNum: number;
}
export class WyLyric {
  lrc: Lyric;
  lines: LyricLine[] = [];
  // 播放状态
  playing = false;
  curNum: number;
  //   开始播放时间
  startStamp: number;
  handler = new Subject<Handler>();
  timer$: Subscription;
  //   记录暂停时间
  pauseStamp: number;
  constructor(lrc: Lyric) {
    this.lrc = lrc;
    this.init();
  }

  init() {
    if (this.lrc.tlyric) {
      this.generTLyric();
    } else {
      this.generLyric();
    }
  }
  // 单语歌词
  generLyric() {
    const lines = this.lrc.lyric.split("\n");
    console.log("lrc", lines);
    lines.forEach((line) => this.makeLine(line));
    console.log("lines", this.lines);
  }
  // 双语歌词
  generTLyric() {
    const lines = this.lrc.lyric.split("\n");
    const tlines = this.lrc.tlyric
      .split("\n")
      .filter((item) => timeExp.exec(item) != null);
    const moreLine = lines.length - tlines.length;
    let tempArr = [];
    if (moreLine >= 0) {
      tempArr = [lines, tlines];
    } else {
      tempArr = [tlines, lines];
    }

    const first = timeExp.exec(tempArr[1][0])[0];
    console.log(",,,,,,,,,,,,,,,,", first);
    const skipIndex = tempArr[0].findIndex((item) => {
      const exec = timeExp.exec(item);
      if (exec) {
        return exec[0] === first;
      }
    });

    const _skip = skipIndex === -1 ? 0 : skipIndex;
    const skipItems = tempArr[0].slice(0, _skip);
    if (skipItems.length) {
      skipItems.forEach((line) => this.makeLine(line));
    }
    let zipLines$;
    if (moreLine > 0) {
      zipLines$ = zip(from(lines).pipe(skip(_skip)), from(tlines));
    } else {
      zipLines$ = zip(from(lines), from(tlines).pipe(skip(_skip)));
    }
    zipLines$.subscribe(([line, tline]) => this.makeLine(line, tline));
  }

  makeLine(line: string, tline = "") {
    // 查询是否有时间
    const result = timeExp.exec(line);
    console.log("时间", result);
    if (result) {
      const txt = line.replace(timeExp, "").trim();
      const txtCn = tline ? tline.replace(timeExp, "").trim() : "";
      if (txt) {
        let thirdResult = result[3] || "00";
        const len = thirdResult.length;
        const _thirdResult =
          len > 2 ? parseInt(thirdResult) : parseInt(thirdResult) * 10;
        const time =
          Number(result[1]) * 60 * 1000 +
          Number(result[2]) * 1000 +
          _thirdResult;
        this.lines.push({ txt, txtCn, time });
      }
    }
  }
  // 默认为0从最开始播放
  play(startTime = 0, skip = false) {
    if (!this.lines.length) return;
    if (!this.playing) {
      this.playing = true;
    }
    // 当前正在播放第几行歌词
    this.curNum = this.findCurNum(startTime);
    console.log("curNum", this.curNum);
    // 保存时间戳
    this.startStamp = Date.now() - startTime;
    if (!skip) {
      this.callHandler(this.curNum - 1);
    }
    if (this.curNum < this.lines.length) {
      this.clearTimer();
      this.playReset();
    }
  }
  // 继续往下播放
  playReset() {
    // 拿到当前在播放的这行数据
    let line = this.lines[this.curNum];
    /**
     * Date.now()-this.startStamp：从开始播放到播放到当前行经过了多少毫秒
     * line.time：这行歌词本身是多少毫秒
     */
    const delay = line.time - (Date.now() - this.startStamp);
    this.timer$ = timer(delay).subscribe(() => {
      // 每播放一行歌词，把当前播放的数据返发到外界去
      this.callHandler(this.curNum++);
      if (this.curNum < this.lines.length && this.playing) {
        this.playReset();
      }
    });
    // this.timer = setTimeout(() => {
    //   // 每播放一行歌词，把当前播放的数据返发到外界去
    //   this.callHandler(this.curNum++);
    //   if (this.curNum < this.lines.length && this.playing) {
    //     this.playReset();
    //   }
    // }, delay);
  }

  clearTimer() {
    this.timer$ && this.timer$.unsubscribe();
  }

  callHandler(i: number) {
    if (i > 0) {
      this.handler.next({
        txt: this.lines[i].txt,
        txtCn: this.lines[i].txtCn,
        lineNum: i,
      });
    }
  }

  findCurNum(time: number): number {
    const index = this.lines.findIndex((item) => time <= item.time);
    return index === -1 ? this.lines.length - 1 : index;
  }

  togglePlay(playing: boolean) {
    const now = Date.now();
    this.playing = playing;
    if (playing) {
      const startTime = (this.pauseStamp || now) - (this.startStamp || now);
      this.play(startTime, true);
    } else {
      this.stop();
      this.pauseStamp = now;
    }
  }

  stop() {
    if (this.playing) {
      this.playing = false;
    }
    this.clearTimer();
  }

  // 快速改变歌词时间
  seek(time: number) {
    this.play(time);
  }
}
