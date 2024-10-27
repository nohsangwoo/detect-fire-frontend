
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
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ username, password: hashedPassword }),
        credentials: 'include', // 쿠키를 포함하도록 설정
        // withCredentials: true,
      })
  
      console.log('응답 헤더:', response.headers)
      console.log('쿠키:', response.headers.get('set-cookie'))
  
      if (!response.ok) {
        const errorData = await response.json()
        console.error('오류 상세:', errorData.detail)
        throw new Error(errorData.detail || '로그인 실패')
      }
  
      const data = await response.json()
      return data
    } catch (error) {
      console.error('로그인 오류:', error)
      throw error
    }
  }