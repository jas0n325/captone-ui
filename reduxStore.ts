import { applyMiddleware, compose, createStore, Store } from "redux";
import createSagaMiddleware from "redux-saga";

import { modalMiddleware } from "./middleware";
import reducers from "./reducers";
import rootSaga from "./sagas";


// Implemented here in order to be able to import the store and initialize the auth redux component
const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || compose;
const store: Store<any> = createStore(reducers,
    composeEnhancers(applyMiddleware(modalMiddleware, sagaMiddleware)));

export default store;

sagaMiddleware.run(rootSaga);
