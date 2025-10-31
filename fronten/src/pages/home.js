import { useEffect, useState } from "react"

// Components 
import MessageDetails from '../components/messageDetails'
import MessageForm from '../components/messageForm'


const Home = () => {
    const [messages,setMessages] = useState(null)

    useEffect(() => {
        const fetchMessages = async () => {
            
            const response = await fetch('http://localhost:4000/api/messages')
            const json = await response.json()

            if(response.ok){
                setMessages(json)
                
            }
        }
        fetchMessages()

    }, []) // only fire when first rendered

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