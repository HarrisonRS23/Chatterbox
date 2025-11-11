import { MessageContext } from "../context/messageContext";
import { useContext } from "react";

export const useMessageContext = () => {
    const context = useContext(MessageContext)

    if(!context){
        throw Error('useMessageContext must be used inside a MessageContextProvider')
    }

    return context
}