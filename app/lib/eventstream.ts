/**
 * Code taken from https://github.com/dan-cooke/remix-sse/
 */

import { useEffect, useRef, useState } from "react";

type DeserializeFn = (raw: string) => any;

type EventOptions<
  TReturnLatest extends boolean,
  TDeserialized extends DeserializeFn | never
> = {
  maxEventRetention?: number;
  channel?: string;
  returnLatestOnly?: TReturnLatest;
  deserialize?: TDeserialized;
  initialData?: ReturnType<TDeserialized>;
};

type LatestOrAllEvents<
  TEvent extends string | any,
  TReturnLatest extends boolean | undefined
> = [TReturnLatest] extends [true] ? TEvent : TEvent[];

type Deserialized<TDeserialized extends DeserializeFn> =
  undefined extends TDeserialized ? string : ReturnType<TDeserialized>;

type UseSubscribeReturn<
  TReturnLatest extends boolean,
  TDeserialized extends DeserializeFn | never
> = LatestOrAllEvents<Deserialized<TDeserialized>, TReturnLatest> | null;

const addNewEvent = (event: any, events: any[], maxEvents: number) => {
  if (events.length > maxEvents) {
    return [...events.shift(), event];
  }
  return [...events, event];
};

function useSubscribe<
  TReturnLatest extends boolean,
  TDeserialize extends DeserializeFn | never
>(
  eventSource: EventSource | undefined,
  options: EventOptions<TReturnLatest, TDeserialize> = {
    maxEventRetention: 50,
    channel: "message",
  }
): UseSubscribeReturn<TReturnLatest, TDeserialize> {
  const {
    deserialize,
    maxEventRetention,
    returnLatestOnly,
    channel,
    initialData,
  } = options;
  const [data, setData] = useState<
    UseSubscribeReturn<TReturnLatest, TDeserialize>
  >(initialData ?? null);

  useEffect(() => {
    if (!eventSource) return;

    function handler(event: MessageEvent) {
      setData((previous) => {
        const newEventData = deserialize
          ? deserialize?.(event.data)
          : event.data;

        if (returnLatestOnly) {
          return newEventData;
        }

        if (Array.isArray(previous)) {
          return addNewEvent(newEventData, previous, maxEventRetention ?? 50);
        }

        if (!previous) {
          return addNewEvent(newEventData, [], maxEventRetention ?? 50);
        }

        return previous;
      });
    }

    const removeListener = () => {
      eventSource.removeEventListener(channel ?? "message", handler);
    };

    const addListener = () => {
      eventSource.addEventListener(channel ?? "message", handler);
    };

    removeListener();
    addListener();

    return () => {
      removeListener();
    };
  }, [
    channel,
    options,
    deserialize,
    maxEventRetention,
    returnLatestOnly,
    eventSource,
  ]);

  return data as any;
}

/**
 * A handy wrapper around `useSubscribe` that creates an `EventSource` for you.
 *
 * Note: this will store the `EventSource` in a map, so if you create multiple
 * `EventSource` instances with the same URL, it will only create one.
 *
 * This allows you to re-use the same `EventSource` instance across multiple
 * components without the need for context.
 *
 * @param url The URL to create an `EventSource` from.
 * @param options Options for the event stream.
 * @returns The data from the event stream.
 **/
export function useEventStream<
  TReturnLatest extends boolean,
  TDeserialize extends DeserializeFn | never
>(url: string, options?: EventOptions<TReturnLatest, TDeserialize>) {
  const createdRef = useRef(false);
  const [source, setSource] = useState<EventSource | undefined>(undefined);
  useEffect(() => {
    if (createdRef.current) return;
    let _source = sources.get(url) || new EventSource(url);
    sources.set(url, _source);
    setSource(_source);
    createdRef.current = true;
  }, [url]);
  return useSubscribe(source, options);
}
const sources = new Map<string, EventSource>();
