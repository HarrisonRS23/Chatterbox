import { useEffect } from "react"
import { useMessageContext } from "../hooks/useMessageContext"

// Components 
import MessageDetails from '../components/messageDetails'
import MessageForm from '../components/messageForm'

const Home = () => {
    const {messages, dispatch} = useMessageContext()

    useEffect(() => {
        const fetchMessages = async () => {
            
            const response = await fetch('http://localhost:4000/api/messages')
            const json = await response.json()

            if(response.ok){
               dispatch({type: 'SET_MESSAGES', payload:json})
            }
        }
        fetchMessages()

    }, [dispatch]) // only fire when first rendered

    return (
        <div className="home">
            <div className="messages">
                {messages && messages.map((message) => (
                    <MessageDetails key={message._id} message = {message}></MessageDetails>
                ))}
            </div>            
            <MessageForm></MessageForm>
        </div>
    )
}

export default Home