const { useState } = require("react")

const MessageForm = () => {
    const [recipient, setRecipient] = useState('')
    const [contents, setContents] = useState('')
    const [sender, setSender] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        const message = { recipient, contents, sender }

        const response = await fetch('/api/messages/', {
            method: 'POST',
            body: JSON.stringify(message),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const json = await response.json()

        if (!response.ok) {
            setError(json.error)
        }
        if (response.ok) {
            setContents('')
            setRecipient('')
            setSender('')
            setError(null)
            console.log("New message Added")
        }
    }


    return (
        <form className="create" onSubmit={handleSubmit}>
            <h3>Send a new message</h3>
            <label>Recipient</label>
            <input
                type="text"
                onChange={(e) => setRecipient(e.target.value)}
                value={recipient}
            />

            <label>Sender</label>
            <input
                type="text"
                onChange={(e) => setSender(e.target.value)}
                value={sender}
            />

            <label>Contents</label>
            <input
                type="text"
                onChange={(e) => setContents(e.target.value)}
                value={contents}
            />

            <button>
                Send message
            </button>
            {error && <div className="error">{error}</div>}
        </form>

    )
}

export default MessageForm