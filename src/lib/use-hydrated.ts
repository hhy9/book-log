import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * 서버에서는 false, 클라이언트 하이드레이션 이후에는 true를 반환한다.
 * localStorage(zustand persist) 기반 상태를 SSR 불일치 없이 렌더하기 위해 사용.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
