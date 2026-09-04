import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Màn hình có hẹp hơn `breakpoint` không.
 *
 * Dùng khi JS phải quyết định giống hệt một class Tailwind: truyền đúng con số
 * của breakpoint đó (md = 768, lg = 1024). Lệch nhau là sinh ra vùng chết —
 * CSS ẩn một panel còn JS lại tưởng panel đó đang hiện.
 */
export function useIsBelow(breakpoint: number) {
  const [below, setBelow] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setBelow(window.innerWidth < breakpoint);
    mql.addEventListener("change", onChange);
    setBelow(window.innerWidth < breakpoint);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return !!below;
}

export function useIsMobile() {
  return useIsBelow(MOBILE_BREAKPOINT);
}
