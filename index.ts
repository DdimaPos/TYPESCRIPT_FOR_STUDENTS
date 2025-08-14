type HTTP_METHODS = "POST" | "PUT" | "DELETE" | "PATCH" | "GET";
type RequestStatus = 200 | 500 | 400;

interface userData {
  name: string;
  age: number;
  roles: Array<string>;
  createdAt: Date;
  isDeleted: boolean;
}

interface RequestData {
  method: HTTP_METHODS;
  host: string;
  path: string;
  body?: userData;
  params: Record<string, string>;
}

interface RequestError {
  message: string;
}

interface RequestStatusObject {
  status: RequestStatus;
}

interface ObserverHandlers {
  next: (value: RequestData) => RequestStatusObject;
  error: (error: RequestError) => RequestStatusObject;
  complete: () => void;
}

class Observer {
  isUnsubscribed: boolean;
  handlers: ObserverHandlers;
  public _unsubscribe: () => void;

  constructor(handlers: ObserverHandlers) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: RequestData): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: RequestError): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete(): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe(): void {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

class Observable {
  _subscribe: (arg0: Observer) => () => void;
  _unsubscribe: () => void;

  constructor(subscribe: (arg0: Observer) => () => void) {
    this._subscribe = subscribe;
  }

  static from(values: RequestData[]) {
    return new Observable((observer: Observer) => {
      values.forEach((value: RequestData) => observer.next(value));

      observer.complete();

      return () => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(obs: ObserverHandlers) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}
const HTTP_POST_METHOD: HTTP_METHODS = "POST";
const HTTP_GET_METHOD: HTTP_METHODS = "GET";

const HTTP_STATUS_OK: RequestStatus = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR: RequestStatus = 500;

const userMock: userData = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: RequestData[] = [
  {
    method: HTTP_POST_METHOD,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: HTTP_GET_METHOD,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest = (request: RequestData): RequestStatusObject => {
  // handling of request
  return { status: HTTP_STATUS_OK };
};

const handleError = (error: RequestError): RequestStatusObject => {
  // handling of error
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = (): void => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
