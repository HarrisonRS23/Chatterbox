import { useMessageContext } from '../hooks/useMessageContext'
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


// // date fns

// const WorkoutDetails = ({ workout }) => {
//   const { dispatch } = useWorkoutsContext()

//   const handleClick = async () => {
//     const response = await fetch('/api/workouts/' + workout._id, {
//       method: 'DELETE'
//     })
//     const json = await response.json()

//     if (response.ok) {
//       dispatch({type: 'DELETE_WORKOUT', payload: json})
//     }
//   }

//   return (
//     <div className="workout-details">
//       <h4>{workout.title}</h4>
//       <p><strong>Load (kg): </strong>{workout.load}</p>
//       <p><strong>Number of reps: </strong>{workout.reps}</p>
//       <p>{formatDistanceToNow(new Date(workout.createdAt), { addSuffix: true })}</p>
//       <span className="material-symbols-outlined" onClick={handleClick}>delete</span>
//     </div>
//   )
// }

// export default WorkoutDetails