import { login } from '@/api/auth'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Bounce, toast } from 'react-toastify'

interface LoginCredentials {
  username: string
  password: string
}

interface ErrorResponse {
  detail: string
}

interface useLoginProps {
  onSuccessFunction?: () => void
}

export const useLogin = ({ onSuccessFunction }: useLoginProps) => {
  return useMutation({
    mutationFn: async ({ username, password }: LoginCredentials) => {
      return login(username, password)
    },
    onSuccess: data => {
      onSuccessFunction && onSuccessFunction()
      toast.success('로그인 성공', {
        position: 'bottom-center',
        theme: 'dark',
        transition: Bounce,
      })
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const errorMessage = error || '로그인 중 오류가 발생했습니다.'
      toast.error('로그인 실패', {
        position: 'bottom-center',
        theme: 'dark',
        transition: Bounce,
      })
    },
  })
}
