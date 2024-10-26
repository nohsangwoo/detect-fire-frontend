'use client'

import { useMutation } from '@tanstack/react-query'
import { signUp } from '../api/auth'

export const useSignUp = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => {
      return signUp(email, password)
    },
    onSuccess: (data, variables, context) => {
      console.log('회원가입 성공 data: ', data)
    },
    onError: error => {
      console.error('회원가입 실패:', error)
    },
  })
}
