//import { useMessageContext } from '../hooks/useMessageContext'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'


const MessageDetails = ( { message }) => {
    return (
        <div className="message-details">
            <h4>From: {message.sender}</h4>
            <h4>To: {message.recipient}</h4>
            <p>{message.contents}</p>
            <p>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</p>

        </div>
    )
}
export default MessageDetails 