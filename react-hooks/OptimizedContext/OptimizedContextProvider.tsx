import React, {
    Context,
    ReactElement,
    ReactNode,
    useRef,
    useMemo,
    useCallback,
    useLayoutEffect,
} from 'react';
import useAutoRef from "../useAutoRef";

export type OptimizedContext<Value> = Context<{
    // function that takes a callback as argument, and returns a callback, that unsubscribes the callback
    subscribe: (callback: () => void) => () => void;
    // function that returns the contexts value and the version of the value (number of times the value has changed)
    getContextMeta: () => {
        version: number;
        value: Value;
    };
}>

export type OptimizedContextProviderProps<Value> = {
    value: Value;
    context: OptimizedContext<Value>;
    children: ReactNode;
}

// Provider for providing OptimizedContexts
export default function OptimizedContextProvider<Value> ({ value, context, children, }: OptimizedContextProviderProps<Value>): ReactElement<any, any> {
    const valueRef = useAutoRef(value);
    // version reflects the number of times value has changed
    const contextVersionRef = useRef(-1);
    // update version when ever value changes
    useMemo(() => {
        contextVersionRef.current++;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ value, ]);

    // create subscriptions list on first render
    const subscriptions = useMemo<Array<() => void>>(() => [], []);
    // callback for subscribing to OptimizedContext
    const subscribe = useCallback((callback: () => void) => {
        // create wrapper around callback to ensure that correct callback gets removed on unsubscribe
        const wrappedCallback = () => callback();
        subscriptions.push(wrappedCallback);
        // return callback so that callee can unsubscribe
        return function unSubscribe() {
            const index = subscriptions.indexOf(wrappedCallback);
            subscriptions.splice(index, 1);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Notify all subscribers after value has changed so that they can determine if to rerender
    const getContextMeta = useCallback(() => {
        return {
            version: contextVersionRef.current,
            value: valueRef.current,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useLayoutEffect(() => {
        subscriptions.forEach(sub => sub());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ contextVersionRef.current, ]);

    const contextValue = useMemo(() => {
        return {
            subscribe,
            getContextMeta,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const { Provider, } = context;
    return (
        <Provider value={contextValue}>
            {children}
        </Provider>
    );
}
