import { useMessageContext } from '../hooks/useMessageContext'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'


const MessageDetails = ({ message }) => {
    const { user } = useMessageContext();
    
    // Get sender ID (could be object with _id or just string _id)
    const senderId = message.sender?._id?.toString() || message.sender?.toString() || '';
    const currentUserId = user?._id?.toString() || user?.id?.toString() || '';
    
    // Determine if message is sent by current user
    const isSent = senderId === currentUserId;
    
    return (
        <div className={`message ${isSent ? 'sent' : 'received'}`}>
            <div className="message-bubble">
                <p className="message-text">{message.contents}</p>
                <span className="message-time">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </span>
            </div>
        </div>
    )
}
export default MessageDetails 