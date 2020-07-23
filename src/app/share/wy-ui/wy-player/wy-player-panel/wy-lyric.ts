import { Lyric } from 'src/app/services/date.types/common.types';
import { skip } from 'rxjs/internal/operators';
import { from, zip } from 'rxjs';

// [03:16.630]
const timeExp = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/;

export interface BaseLyricLine {
    txt: string;
    txtCn: string;
}

interface LyricLine extends BaseLyricLine {
    time: number
}
export class WyLyric {
    lrc: Lyric;
    lines: LyricLine[] = [];
    // 播放状态
    playing = false;
    curNum: number;
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
        const lines = this.lrc.lyric.split('\n');
        console.log("lrc", lines);
        lines.forEach(line => this.makeLine(line))
        console.log('lines', this.lines)
    }
    // 双语歌词
    generTLyric() {
        const lines = this.lrc.lyric.split('\n');
        const tlines = this.lrc.tlyric.split('\n').filter(item => timeExp.exec(item) != null);
        // console.log("\\\\\\\\\\\\\\\\\\\\", lines);
        // console.log('....................', tlines)
        const moreLine = lines.length - tlines.length;
        let tempArr = [];
        if (moreLine >= 0) {
            tempArr = [lines, tlines];
        } else {
            tempArr = [tlines, lines];
        }

        const first = timeExp.exec(tempArr[1][0])[0];
        console.log(',,,,,,,,,,,,,,,,', first);
        const skipIndex = tempArr[0].findIndex(item => {
            const exec = timeExp.exec(item);
            if (exec) {
                return exec[0] === first;
            }
        })

        const _skip = skipIndex === -1 ? 0 : skipIndex;
        const skipItems = tempArr[0].slice(0, _skip);
        if (skipItems.length) {
            skipItems.forEach(line => this.makeLine(line))
        }
        let zipLines$;
        if (moreLine > 0) {
            zipLines$ = zip(from(lines).pipe(skip(_skip)), from(tlines));
        } else {
            zipLines$ = zip(from(lines), from(tlines).pipe(skip(_skip)));
        }
        zipLines$.subscribe(([line, tline]) => this.makeLine(line, tline))
    }

    makeLine(line: string, tline = '') {
        // 查询是否有时间
        const result = timeExp.exec(line);
        console.log("时间", result);
        if (result) {
            const txt = line.replace(timeExp, '').trim();
            const txtCn = tline ? tline.replace(timeExp, '').trim() : '';
            if (txt) {
                let thirdResult = result[3] || '00';
                const len = thirdResult.length;
                const _thirdResult = len > 2 ? parseInt(thirdResult) : parseInt(thirdResult) * 10;
                const time = Number(result[1]) * 60 * 1000 + Number(result[2]) * 1000 + _thirdResult;
                this.lines.push({ txt, txtCn, time });
            }
        }
    }
    // 默认为0从最开始播放
    play(startTime = 0) {
        if (!this.lines.length) return;
        if (!this.playing) {
            this.playing = true;
        }
        // 当前正在播放第几行歌词
        this.curNum = this.findCurNum(startTime);
        console.log("curNum",this.curNum);
    }

    findCurNum(time: number): number {
        const index = this.lines.findIndex(item => time <= item.time);
        return index === -1 ? this.lines.length - 1 : index;
    }
}


