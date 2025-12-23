import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { of, tap } from "rxjs";


const cache = new Map();
const CHACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cacheInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {

    if (req.method !== 'GET') {
        return next(req);
    }

    const cachedResponse = cache.get(req.urlWithParams);
    const now = Date.now();

    if (cachedResponse && (now - cachedResponse.timestamp) < CHACHE_DURATION) {
        return of(cachedResponse.data);
    }

    return next(req)
        .pipe(
            tap(response => {
                cache.set(req.urlWithParams, { data: response, timestamp: Date.now() });
            })
        )

}