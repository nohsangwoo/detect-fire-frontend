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
  onErrorFunctionForNeedApproval?: () => void
}

const useLogin = ({
  onSuccessFunction,
  onErrorFunctionForNeedApproval,
}: useLoginProps) => {
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
      const errorMessage = error.message || '로그인 중 오류가 발생했습니다.'
      if (errorMessage === '이메일 인증이 필요합니다.') {
        toast.warn(errorMessage, {
          position: 'bottom-center',
          theme: 'dark',
          transition: Bounce,
        })
        onErrorFunctionForNeedApproval && onErrorFunctionForNeedApproval()
      } else {
        toast.error(errorMessage, {
          position: 'bottom-center',
          theme: 'dark',
          transition: Bounce,
        })
      }
    },
  })
}

export default useLogin
