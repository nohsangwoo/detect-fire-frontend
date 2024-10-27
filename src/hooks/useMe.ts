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
  console.log('fetchMe response: ', response)
  return response
}

const useMe = () => {
  const query = useQuery<User, Error>({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false,
    refetchOnWindowFocus: false,
    // 아래 옵션들을 추가합니다
    gcTime: 0,
    staleTime: 0,
    refetchInterval: 0,
  })

  return query
}

export default useMe
