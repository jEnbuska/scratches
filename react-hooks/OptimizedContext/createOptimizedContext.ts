import {createContext} from "react";
import {OptimizedContext} from "./OptimizedContextProvider";

// util for creating optimized context with default value
export default function createOptimizedContext<Value>(value: Value): OptimizedContext<Value> {
    return createContext({
        subscribe(...args: any) {
            console.error('Component using OptimizedContext without Context.Provider')
            return () => {}
        },
        getContextMeta() {
            return {
                version: 1,
                value,
            }
        }
    })
}