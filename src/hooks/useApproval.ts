'use client'

import { approval, signUp } from '@/api/auth'
import { useMutation } from '@tanstack/react-query'
import { Bounce, toast } from 'react-toastify'

interface useApprovalProps {}

const useApproval = ({}: useApprovalProps) => {
  return useMutation({
    mutationFn: async ({
      email,
      validation_number,
    }: {
      email: string
      validation_number: string
    }) => {
      return approval(email, validation_number)
    },
    onSuccess: (data, variables, context) => {
      toast.success('승인완료', {
        position: 'bottom-center',
        theme: 'dark',
        transition: Bounce,
      })
    },
    onError: error => {
      const errorMessage = error.message || '승인 중 오류가 발생했습니다.'
      console.error('승인 실패:', errorMessage)
      toast.error(errorMessage, {
        position: 'bottom-center',
        theme: 'dark',
        transition: Bounce,
      })
    },
  })
}

export default useApproval
