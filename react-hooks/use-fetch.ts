import {useCallback, useEffect, useMemo, useRef, useState} from "react";

interface UseApiState<TData> {
    data?: TData;
    loading: boolean;
    error?: string;
    status?: number;
}
const initialState = {
    loading: false,
    data: undefined,
    error: undefined
}
const defaultHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json",
};

type FetchMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
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

function useApi<TData>() {
    const [state, setState] = useState<UseApiState<TData>>(initialState);
    const requestCounter = useRef(0);
    useEffect(() => () => requestCounter.current++); // when component unmounts, responses are ignored
    const startFetch = useCallback(async (fetchArgument: FetchArgument) => {
        const requestNumber = ++requestCounter.current;
        const { url, method, setLoading = true, resetData = true, clearError = true, resetStatus = true, headers } = fetchArgument;
        setState((prevState) => {
            return {
                ...prevState,
                loading: setLoading,
                error: clearError ? undefined : prevState.error,
                data: resetData ? undefined : prevState.data,
                status: resetStatus ? undefined : prevState.status,
            }
        });
        const body = parseRequestBody(fetchArgument.body);
        const response = await api(url, { method, headers: { ...defaultHeaders, ...headers}, body, })
        if (requestNumber !== requestCounter.current) {
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
        const createFetchMethod = (method: FetchMethod) => {
            return (arg: Omit<FetchArgument, 'method'>) => startFetch({...arg, method})
        }
        return {
            get: createFetchMethod('GET'),
            post: createFetchMethod('POST'),
            put: createFetchMethod('PUT'),
            del: createFetchMethod('DELETE'),
        }
    }, []);
    return [state, methods];
}

export const api = (...args: any[]): any => {
    console.warn('api not implemented')
}

export const parseError = (...args: any[]): any => {
    console.warn('parseError not implemented')
}

export const parseRequestBody = (body: any): any => {
    console.warn('parseRequestBody not implemented')
}

