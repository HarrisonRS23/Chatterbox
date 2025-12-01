import { useMessageContext } from '../hooks/useMessageContext'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import API_URL from '../config/api'
import { useEffect, useState } from 'react'

const MessageDetails = ({ message }) => {
    const { user } = useMessageContext();
    const [imageSrc, setImageSrc] = useState(null);
    
    // Get sender ID (could be object with _id or just string _id)
    const senderId = message.sender?._id?.toString() || message.sender?.toString() || '';
    const currentUserId = user?._id?.toString() || user?.id?.toString() || '';
    
    // Determine if message is sent by current user
    const isSent = senderId === currentUserId;
    
    // Get sender name for display
    const getSenderName = () => {
        if (isSent) {
            return "You";
        }
        if (message.sender) {
            if (typeof message.sender === 'object') {
                if (message.sender.firstname && message.sender.lastname) {
                    return `${message.sender.firstname} ${message.sender.lastname}`;
                }
                return message.sender.email || "Unknown";
            }
        }
        return "Unknown";
    };
    
    const senderName = getSenderName();
    
    // Check if message has an image
    const hasImage = message.imageId || (message.image && message.image.contentType);
    
    // Fetch image as blob and convert to data URL for display
    useEffect(() => {
        if (!hasImage) return;
        
        const fetchImage = async () => {
            try {
                const imageUrl = `${API_URL}/api/messages/image/${message.imageId || message._id}`;
                const response = await fetch(imageUrl, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}` // Bearer used to tell backend which user is making the request
                    }
                });
                
                if (!response.ok) {
                    console.error('Failed to fetch image:', response.status);
                    return;
                }
                
                const blob = await response.blob();
                const dataUrl = URL.createObjectURL(blob);
                setImageSrc(dataUrl);
            } catch (err) {
                console.error('Error fetching image:', err);
            }
        };
        
        fetchImage();
        
        // Cleanup blob URL on unmount
        return () => {
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [hasImage, message.imageId, message._id]);
    
    return (
        <div className={`message ${isSent ? 'sent' : 'received'}`}>
            {!isSent && (
                <span className="message-sender">{senderName}</span>
            )}
            <div className="message-bubble">
                {message.contents && (
                    <p className="message-text">{message.contents}</p>
                )}
                {imageSrc && (
                    <div className="message-image-container">
                        <img 
                            src={imageSrc} 
                            alt="Message attachment" 
                            className="message-image"
                        />
                    </div>
                )}
                <div className="message-footer">
                    {isSent && <span className="message-sender-inline">{senderName}</span>}
                    <span className="message-time">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                </div>
            </div>
        </div>
    )
}
export default MessageDetails 