import { useMutation } from '@tanstack/react-query'
import { subjectChat } from '../service'

export function useSubjectChat() {
  return useMutation(async ({ subjectName, prompt }) => {
    const data = await subjectChat(subjectName, prompt)
    return data
  })
}

export default useSubjectChat
