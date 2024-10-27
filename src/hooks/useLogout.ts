import { logout } from '@/api/auth'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export const useLogout = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: data => {
      console.log('로그아웃 성공: ', data)
      // 로그아웃 성공 시 처리
      router.push('/login') // 로그인 페이지로 리다이렉트
    },
    onError: error => {
      // 에러 처리
      console.error('로그아웃 중 오류 발생:', error)
    },
  })
}
