const initialState = {
  user: null,
  userType: null,
  callSession: null,
  onCall: false,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
      };
    case 'GET_USER':
      return state;
    case 'SET_USER_TYPE':
      return {
        ...state,
        userType: action.payload,
      };
    case 'GET_USER_TYPE':
      return state.userType;
    case 'CLEAR_USER_TYPE':
      return {
        ...state,
        userType: null,
      };
    case 'CALL_SESSION':
      return {
        ...state,
        callSession: state.callSession,
      };
    case 'ON_CALL':
      return {
        ...state,
        onCall: state.onCall,
      };
    default:
      return state;
  }
};

export default userReducer;
