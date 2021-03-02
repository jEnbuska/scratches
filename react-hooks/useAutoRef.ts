import {DependencyList, useMemo, useRef} from "react";

// util hook for creating self updating refs
export default function useAutoRef<T>(value: T, deps?: DependencyList) {
    const ref = useRef(value);
    useMemo(() => {
        ref.current = value;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return ref;
}
