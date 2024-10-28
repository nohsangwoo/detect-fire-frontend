'use client'

import { signUp } from '@/api/auth'
import { useMutation } from '@tanstack/react-query'
import { Bounce, toast } from 'react-toastify'

interface useSignUpProps {
  onSuccessFunction?: () => void
}

const useSignUp = ({ onSuccessFunction }: useSignUpProps) => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string
      password: string
    }) => {
      return signUp(email, password)
    },
    onSuccess: (data, variables, context) => {
      toast.success('승인번호를 입력해주세요.', {
        position: 'bottom-center',
        theme: 'dark',
        transition: Bounce,
      })
      onSuccessFunction && onSuccessFunction()
    },
    onError: error => {
      console.error('회원가입 실패:', error)
      toast.error('회원가입 실패', {
        position: 'bottom-center',
        theme: 'dark',
        transition: Bounce,
      })
    },
  })
}

export default useSignUp
