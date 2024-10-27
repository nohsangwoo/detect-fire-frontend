import { clientSideHashingPassword } from '@/lib/hashingPassword'
import axios from 'axios'

const API_URL = 'http://localhost:8000' // 개발 환경에서는 HTTP 사용

export const signUp = async (email: string, password: string) => {
  const hashedPassword = clientSideHashingPassword(password)

  const response = await axios.post(`${API_URL}/users/`, {
    email,
    password: hashedPassword,
  })
  return response.data
}

export const login = async (username: string, password: string) => {
  const hashedPassword = clientSideHashingPassword(password)

  try {
    const response = await axios.post(
      `${API_URL}/login`,
      new URLSearchParams({ username, password: hashedPassword }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true, // 쿠키를 포함하도록 설정
      },
    )

    console.log('응답 헤더:', response.headers)
    console.log('쿠키:', response.headers['set-cookie'])

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('오류 상세:', error.response.data.detail)
      throw new Error(error.response.data.detail || '로그인 실패')
    } else {
      console.error('로그인 오류:', error)
      throw error
    }
  }
}

export const me = async () => {
  const response = await axios.get(`${API_URL}/me`, {
    withCredentials: true,
  })
  return response.data
}
