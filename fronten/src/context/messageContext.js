import { createContext, useReducer } from "react";

export const MessageContext = createContext()

export const messageReducer = (state,action) => {
    switch(action.type){
        case 'SET_MESSAGES':
            return {
                messages: action.payload
            }
        case 'CREATE_MESSAGE':
            return {
                messages: [action.payload, ...state.messages]
            }

        default: 
            return state
    }
}

export const MessageContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(messageReducer, {
        messages: null
    })

    return (
        <MessageContext.Provider value={{...state,dispatch}}>
            {children}
        </MessageContext.Provider>
    )
}