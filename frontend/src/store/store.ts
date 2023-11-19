// store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import typingReducer from "./slices/typingSlice";
import loadingReducer from "./slices/loadingSlice";
import formReducer from "./slices/formSlice";
import dialogueIndexReducer from "./slices/dialogueIndexSlice";
import dialogueDetailsReducer from "./slices/dialogueDetailsSlice";
import dialogueReducer from "./slices/dialogueIdSlice";
import chatReducer from "./slices/chatSlice";

const rootReducer = combineReducers({
  dialogueIndex: dialogueIndexReducer,
  typing: typingReducer,
  loading: loadingReducer,
  form: formReducer,
  dialogueDetails: dialogueDetailsReducer,
  dialogue: dialogueReducer,
  chat: chatReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;

export default store;
