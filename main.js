import { fromEvent, animationFrameScheduler,of } from 'rxjs';
import { map, pluck, withLatestFrom,repeat, mergeScan,scan,tap,takeUntil, startWith, share } from 'rxjs/operators';

function lerp(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    return {
        x: start.x + dx * 0.05,
        y: start.y + dy * 0.05,
    };
}

const hoverMain = document.getElementById('hover-main');
const main = document.getElementById('main');
const bounds = {
    main: main.getBoundingClientRect(),
    hoverMain: hoverMain.getBoundingClientRect()
}

let mouseEnter$ = fromEvent(main, 'mouseenter').pipe(
    share()
);
const mouseleave$ = fromEvent(main, 'mouseleave').pipe(
    share()
);
const mousemove$ = fromEvent(main, 'mousemove').pipe(
    map(e => ({ x: e.clientX, y: e.clientY }))
)

const animationFrame$ = of(0, animationFrameScheduler).pipe(
    repeat()
)

const mouseMoveonFrame$ = animationFrame$.pipe(
    withLatestFrom(mousemove$),
    pluck(1)
)


let updatedMoves$ = mouseEnter$.pipe(
    mergeScan((acc, curr) => {
        return mouseMoveonFrame$.pipe(
            startWith(acc),
            scan(lerp),
            takeUntil(mouseleave$)
        )
    }, { x: 0, y: 0 })
);


updatedMoves$.subscribe(({ x, y }) => {
    x = (x - bounds.main.left) - bounds.hoverMain.width/2;
    y =  (y - bounds.main.top) - bounds.hoverMain.height/2
    hoverMain.style.cssText = `
          transform: translate(${x}px,${y}px);
        `;
}
)

mouseEnter$.subscribe(()=> hoverMain.classList.add('reveal') )

mouseleave$.subscribe(()=>  hoverMain.classList.remove('reveal') )


