const LOAD = 'blocks/LOAD';
const LOAD_SUCCESS = 'blocks/LOAD_SUCCESS';
const LOAD_FAIL = 'blocks/LOAD_FAIL';

const initialState = {
  loaded: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result,
        error: null
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        data: null,
        error: action.error
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.blocks && globalState.blocks.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get('/visualizations/blocks/day/num')
        .then((data) => {
          const dataPoints = data.data;
          dataPoints.forEach((point) => point.x *= 1000); // s -> ms
          return data;
        })
  };
}
