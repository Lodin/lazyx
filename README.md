# lazyx

Lazyx is the predictable state container for JavaScript applications built on top of 
[RxJS 5](https://github.com/ReactiveX/rxjs). It is highly inspired by 
[Redux](https://github.com/reactjs/redux) and provides the same functional-style approach. 

In fact, Lazyx is just a thin layer on top of RxJS. It provides a system to use RxJS more effective 
and simplifies some regular actions. 

## Install
```bash
$ npm install --save lazyx
```

## Basics
Lazyx is based on the idea of predefined data transformation pipe (aka Data Pipe). This idea is 
very like the Redux concept, so if you know it, you could find following descriptions very 
familiar. Lazyx is consists of three parts:
* Trigger,
* Transformer,
* Store.

### Trigger
Let's define Trigger at first.

Trigger is the start point of Data Pipe. It sends the information payload through to the Transformer
to change it current state and notify all its subscribers.

Trigger is the simple RxJS Subject, that you can import to the component module and use its `next` 
method to start the data transformation process.

Here is an example Trigger for creating a new todo item: 
```typescript
import {Subject} from 'rxjs';

const addTodo$ = new Subject();

addTodo$.next({
  text: 'Build my first Lazyx app',
});
```
If you have an observable sequence of observables like array or object, you can use special 
`SubjectMap` of Lazyx to simplify creating Trigger for sequence elements.
```typescript
import {SubjectMap} from 'lazyx';

const todoToggle$ = new SubjectMap();

const id = 1;
todoToggle$.get(id).next();
```
`SubjectMap` signature is following:
```typescript
interface ISubjectMap {
  get(id: any); // get existing Subject with specified `id` or creates new one
  remove(id: any); // removes Subject with specified `id`
}
```
`SubjectMap` allows you to run the trigger with specified `id` and use only the one Transformer this
Subject belongs to. 

### Transformer
Transformer is the main part of Lazyx. It receives signals from number of Triggers, changes inner 
state and sends the update to all subscribers it has. 

Here is an example of Transformer: 
```typescript
import {Observable, Subject} from 'rxjs';
import 'lazyx/add/operator/apply';

export const increase$ = new Subject();
export const decrease$ = new Subject();

export const counter$ = Observable.of(0)
  .merge(
    increase$.map(payload => state => state + payload),
    decrease$.map(payload => state => state - payload),
  )
  .apply();
```
**Note:** operator `apply` is the shorthand for `scan((state, reducer) => reducer(state))`.

If you expect that your Transformer would have dynamic initial state, just put it into the function:
```typescript
import {Observable} from 'rxjs';
import {SubjectMap} from 'lazyx';
import 'lazyx/add/operator/apply';

export const toggleTodo = new SubjectMap();

let id = 0;

const initialState = () => ({
  id: id++,
  text: '',
  completed: false,
});

function todo(state = initialState()) {
  return Observable.of(state)
    .merge(
      toggleTodo
        .get(state.id)
        .map(() => state => ({ ...state, completed: !state.completed }))
    )
    .apply();
}

export default todo;
```
We will call this functions `TransformerCreator`.

If you have an observable sequence to create, use special function `mergeSequence` provided by 
Lazyx.

It can be done in the following way:
```typescript
import {Observable, Subject} from 'rxjs';
import todo from './todo'; // the function we defined in the previous example
import 'lazyx/add/operator/mergeSequence';

export const addTodo = new Subject();
export const removeTodo = new Subject();

function todos(state = []) {
  return Observable.of(state)
    .mergeSequence(addTodo, removeTodo, todo)
    .apply();
}

export default todos;
```
Function `mergeSequence` has the following signature:
```typescript
interface MergeSequence<T, U, X> {
  (add: Subject<T>, remove: Subject<U>, creator: (state: X) => Observable<X>): Observable<X>
}
```
**Note:** if you use observable object, you have to send property key in the addition Trigger. 

### Store
Store is a global Transformer holder. It main responsibilities are following:
* Hold all the Transformers together in the hierarchical structure that improves accessibility and 
allows to pass them down through the React context, for example. 
* Provide tools to work with the dynamic initial state, e.g. if it is loaded from the server. 
* Provide tools for adding middlewares. 

To create a Store, you should use `createStore` function of Lazyx. It has following signatures:
```typescript
function createStore<I, P, S>(initializers: I): Store<S>;
function createStore<I, P, S>(initializers: I, preloadedState: P): Store<S>;
function createStore<I, P, S>(initializers: I, middlewares: Middleware[]): Store<S>;
function createStore<I, P, S>(initializers: I, preloadedState: P, middlewares: Middleware[]): Store<S>;
```
Where `Store` is the following object:
```typescript
interface Store<S> {
  getState(): S;
  add<I>(key: string, initializers: I): void;
  merge<I>(initializers: I): void;
}
```
**Note:** `preloadedState` should reflect transformers map but use data instead of transformers. 

So, to create a store, just put your transformers to objects and send the final object to the 
`createStore` function. 
```typescript
import {createStore} from 'lazyx';
import todos from './todos';

const store = createStore({
  todos,
});

export default store;
```

## Advanced
### Middleware
Middleware is a function that starts after transformer produces its result but before this result 
is emitted to the subscribers. Middlewares is implemented with RxJS 
[let](https://www.learnrxjs.io/operators/utility/let.html) function, so, it can change the 
Transformer or let is unchanged. 

In common, middleware is a function that receives a Transformer and returns it. Middleware 
signature is following:
```typescript
type Transformer<T> = Observable<T>;

interface Middleware {
  <T, U>(transformer: Transformer<T>): Transformer<U>
}
```
So, the simple middleware can look like following:
```typescript
function loggerMiddleware<T>(transformer: Transformer<T>): Transformer<T> {
  return transformer
    .do(({name, value}) => console.log(name, value));
}
```
As a `name` will be used the whole path to current Transformer in the Transformers map divided by 
period.

### Ajax
How can you create an ajax-request using Lazyx? You can use the `ajax` method of RxJS and combine it
with Transformers in the following way. 

Let's imagine that we want to get user data from Github API, take repository url from it and send
it to subscribers. User nickname will be sended by Trigger.
```typescript
import {Observable, Subject} from 'rxjs';

const loginTrigger = new Subject();

const repoUrl = Observable.of(null)
  .merge(
    loginTrigger,
  )
  .mergeMap(
    login => 
      login 
        ? Observable.ajax.getJSON(`https://api.github.com/users/${login}`)
            .map(response => response.html_url)
        : Observable.empty()
  )
```
As you can see, there is no Lazyx-specific stuff, only RxJS.

### Trigger Extending
If you want to make Trigger run stricter, you can just extend RxJS Subject and add methods that 
calls Subject's `next` method with predefined objects. For example:
```typescript
import {Subject} from 'rxjs';

class AddTodo extends Subject {
  run(text: string): void {
    this.next({ text });
  }
}

const addTodo$ = new AddTodo();

addTodo$.run('Build my first Lazyx app');
```