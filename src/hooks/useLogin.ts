import { login } from '@/api/auth'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'

interface LoginCredentials {
  username: string
  password: string
}

interface ErrorResponse {
  detail: string
}

export const useLogin = () => {
  return useMutation({
    mutationFn: async ({ username, password }: LoginCredentials) => {
      return login(username, password)
    },
    onSuccess: data => {
      console.log('로그인 성공:', data)
      // 로그인 성공 후 처리 (예: 홈 페이지로 리다이렉트)
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const errorMessage = error || '로그인 중 오류가 발생했습니다.'
      console.error('로그인 실패:', errorMessage)
      // 에러 메시지를 사용자에게 표시하는 로직 추가
    },
  })
}
