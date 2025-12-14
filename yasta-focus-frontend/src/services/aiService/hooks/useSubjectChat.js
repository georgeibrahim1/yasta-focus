
import { useMutation } from '@tanstack/react-query'
import { subjectChat } from '../service'

export function useSubjectChat() {
  return useMutation({
    mutationFn: async ({ subjectName, prompt }) => {
      const data = await subjectChat(subjectName, prompt)
      return data
    },
    onError: (error) => {
      console.error('Subject chat mutation error:', error)
    }
  })
}

export default useSubjectChat