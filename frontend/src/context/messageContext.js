import { createContext, useReducer, useEffect } from "react";

export const MessageContext = createContext();

export const messageReducer = (state, action) => {
  switch (action.type) {
    case "SET_MESSAGES":
      return {
        ...state,
        messages: action.payload,
      };
    case "CREATE_MESSAGE":
      return {
        ...state,
        messages: [...(state.messages || []), action.payload],
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        messages: null,
      };
    default:
      return state;
  }
};

export const MessageContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, {
    messages: null,
    user: null,
  });

  //  persist login state between refreshes
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      dispatch({ type: "SET_USER", payload: storedUser });
    }
  }, []);

  return (
    <MessageContext.Provider value={{ ...state, dispatch }}>
      {children}
    </MessageContext.Provider>
  );
};
