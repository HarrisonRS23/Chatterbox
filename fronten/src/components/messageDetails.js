const MessageDetails = ( { message }) => {
    return (
        <div className="message-details">
            <h4>From: {message.sender}</h4>
            <h4>To: {message.recipient}</h4>
            <p>{message.contents}</p>
        </div>
    )
}
export default MessageDetails 