import {DependencyList, useContext, useEffect, useReducer} from "react";
import {OptimizedContext} from "./OptimizedContextProvider";
import useAutoRef from "../useAutoRef";


/*
Util function used for consuming OptimizedContext.
Updates component when ever DependencyList returned from shouldForceRerender is changed.
Note: if shouldForceRerender returns a different DependencyList,
but component has already rendered with context version number, component will not force rerender.
*/
export default function useOptimizedContext<Value> (
    context: OptimizedContext<Value>,
    shouldForceRerender: (value: Value) => DependencyList
): Value {
    const { subscribe, getContextMeta, } = useContext(context);
    const meta = getContextMeta();
    const forceRerender = useReducer((prev) => prev + 1, 0)[1];
    const localVersionRef = useAutoRef(meta.version);
    const prevDepsRef = useAutoRef<DependencyList>(shouldForceRerender(meta.value));
    const shouldComponentRerenderRef = useAutoRef(shouldForceRerender);
    useEffect(() => {
        return subscribe(() => {
            const { value, version, } = getContextMeta();
            // check if deps change changed
            const deps = shouldComponentRerenderRef.current(value);
            const prevDeps = prevDepsRef.current;
            const depsChanged = deps.length !== prevDeps.length || (
                deps.some((dep, index) => {
                    return dep !== prevDeps[index];
                })
            );

            // store the local version into scopes variable before updating the localVersionRef
            const prevVersion = localVersionRef.current;

            // update local refs
            localVersionRef.current = version;
            prevDepsRef.current = deps;

            if (prevVersion !== version && depsChanged) {
                forceRerender();
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return meta.value;
}