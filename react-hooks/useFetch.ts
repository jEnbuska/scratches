import {useCallback, useEffect, useMemo, useRef, useState} from "react";

interface UseApiState<TData> {
    data?: TData;
    loading: boolean;
    error?: string;
    status?: number;
}

type FetchMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
const fetchMethods: FetchMethod[] = [ 'GET', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH', ];

interface FetchArgument {
    url: string;
    body?: any,
    method: FetchMethod;
    headers?: any;
    setLoading?: boolean;
    resetData?: boolean;
    clearError?: boolean;
    resetStatus?: boolean;
}

type MethodCallback = (arg: Omit<FetchArgument, 'method'>) => Promise<void>;

type FetchMethodCallbacks = {
    [key in FetchMethod]: MethodCallback;
}

type UseFetchReturnValue<TData> = [
    UseApiState<TData>,
    FetchMethodCallbacks,
]

type StartFetch = (fetchArguments: FetchArgument) => Promise<void>

const initialState = {
    loading: false,
    data: undefined,
    error: undefined
}
type UseFetchArgument<TData> = {
    initialLoading: boolean;
    initialData?: TData;
};
export default function useFetch<TData>(config: UseFetchArgument<TData>): UseFetchReturnValue<TData> {

    const [state, setState] = useState<UseApiState<TData>>(initialState);
    const requestCounter = useRef(0);
    useEffect(() => () => requestCounter.current++); // when component unmounts, responses are ignored
    const startFetch: StartFetch = useCallback(async (fetchArgument) => {
        const requestNumber = ++requestCounter.current;
        const { setLoading = true, resetData = true, clearError = true, resetStatus = true, } = fetchArgument;
        setState((prevState) => {
            return {
                ...prevState,
                loading: setLoading,
                error: clearError ? undefined : prevState.error,
                data: resetData ? undefined : prevState.data,
                status: resetStatus ? undefined : prevState.status,
            }
        });
        const { url, method, body, headers, } = fetchArgument;
        const response = await api(url, { method, headers: { ...defaultHeaders, ...headers}, body, })

        if (requestNumber !== requestCounter.current) { // new request started before previous was finished
            return;
        }
        const {status} = response;

        switch(status) {
            case 204:
                return setState((prevState) => {
                    return {...prevState, loading: false, error: undefined, status}
                });
            case 200:
            case 201: {
                const responseData = await response.json();
                return setState({ data: responseData, loading: false, error: undefined, status });
            }
            default:
                return setState((prevState) => ({
                    ...prevState,
                    loading: false,
                    error: parseError(response),
                    status,
                }))
        }
    }, [])
    const methods = useMemo(() => {
        const createFetchMethod = (method: FetchMethod): MethodCallback => {
            return (arg) => startFetch({...arg, method})
        }
        const methodMap: Partial<FetchMethodCallbacks> = {};
        fetchMethods.forEach((method) => {
            methodMap[method] = createFetchMethod(method);
        });
        return methodMap as FetchMethodCallbacks;
    }, []);
    return [state, methods];
}

const defaultHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json",
};

// TODO
const api = (...args: any[]): any => {
    console.warn('api not implemented')
}

// TODO
const parseError = (...args: any[]): any => {
    console.warn('parseError not implemented')
}
