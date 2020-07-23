export function sliderEvent(e: Event) {
    // 冒泡事件
    e.stopPropagation();
    // 默认事件
    e.preventDefault();
}
export function getElementOffset(el: HTMLElement): { top: number; left: number } {
    // 如果getClientRects()方法的length不存在的话就不用了在往下走了
    console.log("el",el)
    if (!el.getClientRects().length) {
        return{
            top:0,
            left:0
        }
    }

    // Element.getBoundingClientRect() 方法返回元素的大小及其相对于视口的位置。
    const rect = el.getBoundingClientRect();
    // ownerDocument返回的是所在的document的对象，
    // defaultView返回所在的document所在的windows对象，不支持IE9以下
    const win = el.ownerDocument.defaultView;
    return {
        top: rect.top + win.pageYOffset,
        left:rect.left +win.pageXOffset,
    }
}