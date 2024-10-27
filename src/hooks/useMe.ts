'use client'

import { me } from '@/api/auth'
import { useQuery } from '@tanstack/react-query'

interface User {
  count_login: number
  created_at: string
  email: string
  expired_at: string
  id: number
  password: string
  plan: string
  role: string
  verified: boolean
  // 필요한 다른 사용자 필드들을 여기에 추가하세요
}

const fetchMe = async (): Promise<User> => {
  const response = await me()
  return response
}

const useMe = () => {
  return useQuery<User, Error>({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export default useMe
