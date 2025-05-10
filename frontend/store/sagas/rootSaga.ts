import { all } from 'redux-saga/effects';
import { recordingSaga } from './recordingSaga';

export default function* rootSaga() {
  console.log('ROOT SAGA: Initializing...');
  yield all([
    recordingSaga()
  ]);
  console.log('ROOT SAGA: Initialized');
} 