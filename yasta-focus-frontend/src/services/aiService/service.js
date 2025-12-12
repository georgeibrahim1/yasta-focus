import { api } from '../api'

export const subjectChat = async (subjectName, prompt) => {
  const res = await api.post('/api/ai/subject-chat', { subjectName, prompt })
  return res.data.data
}

export default { subjectChat }
