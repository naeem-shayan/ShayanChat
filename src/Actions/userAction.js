export const setUser = user => ({
  type: 'SET_USER',
  payload: user,
});

export const getUser = () => ({
  type: 'GET_USER',
});

export const clearUser = () => ({
  type: 'CLEAR_USER',
});

export const setUserType = userType => ({
  type: 'SET_USER_TYPE',
  payload: userType,
});

export const getUserType = userType => ({
  type: 'GET_USER_TYPE',
});

export const clearUserType = () => ({
  type: 'CLEAR_USER_TYPE',
});