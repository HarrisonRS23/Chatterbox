import { useMessageContext } from "../hooks/useMessageContext"
import { useState } from "react"

const MessageForm = ({ receiver }) => {
  const { user, dispatch } = useMessageContext()
  const [contents, setContents] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    const message = {
      sender: user.id,
      recipient: receiver._id,
      contents
    }

    const response = await fetch("http://localhost:4000/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(message)
    })

    const json = await response.json()

    if (!response.ok) {
      setError(json.error)
    } else {
      setContents("")
      setError("")
      dispatch({ type: "CREATE_MESSAGE", payload: json })
    }
  }

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type a message..."
        value={contents}
        onChange={(e) => setContents(e.target.value)}
        required
      />
      <button type="submit">Send</button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}

export default MessageForm
