// import {createStore} from 'redux';
// import userReducer from '../Reducers/userReducer';

// const store = createStore(userReducer);

// export default store;

import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userReducer from '../Reducers/userReducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Add other configuration options if needed
};

const persistedReducer = persistReducer(persistConfig, userReducer);
const store = createStore(persistedReducer);
const persistor = persistStore(store);

export { store, persistor };

