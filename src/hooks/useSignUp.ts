'use client'

import { signUp } from '@/api/auth'
import { useMutation } from '@tanstack/react-query'

export const useSignUp = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string
      password: string
    }) => {
      //   const hashedPassword = clientSideHashingPassword(password)
      //   console.log('hashedPassword: ', hashedPassword)
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
