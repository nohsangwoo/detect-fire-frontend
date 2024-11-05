import { clientSideHashingPassword } from '@/lib/hashingPassword'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const signUp = async (email: string, password: string) => {
  const hashedPassword = clientSideHashingPassword(password)

  const response = await axios.post(`${API_URL}/users/`, {
    email,
    password: hashedPassword,
  })
  return response.data
}

export const login = async (username: string, password: string) => {
  const hashedPassword = clientSideHashingPassword(password)

  try {
    const response = await axios.post(
      `${API_URL}/login`,
      new URLSearchParams({ username, password: hashedPassword }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true, // 쿠키를 포함하도록 설정
      },
    )

    // console.log('응답 헤더:', response.headers)
    // console.log('쿠키:', response.headers['set-cookie'])

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.log('오류 상세:', error.response.data.detail)
      throw new Error(error.response.data.detail || '로그인 실패')
    } else {
      console.log('로그인 오류:', error)
      throw error
    }
  }
}

// 쿠키 정보를 같이 보내야 하기 때문에 쿠키 정보를 받아와서 헤더에 덮어씌우는 장치를 만들어 놓음.
export const me = async (cookies?: string) => {
  console.log("cookies in me: ", cookies)
  try {
    const response = await axios.get(`${API_URL}/me`, {
      withCredentials: true,
      headers: cookies
        ? {
            Cookie: cookies,
          }
        : undefined,
    })
    return response?.data
  } catch (error) {
    return null
  }
}

export const logout = async (cookies?: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/logout`,
      {},
      {
        withCredentials: true,
        headers: cookies
          ? {
              Cookie: cookies,
            }
          : undefined,
      },
    )
    return response.data
  } catch (error) {
    return null
  }
}

// export const approval = async (signupCode: string) => {
//   const response = await axios.post(`${API_URL}/verify-email`, { signupCode }, { withCredentials: true })
//   return response.data
// }

export const approval = async (email: string, validation_number: string) => {
  console.log("check apiurl in approval: ", API_URL)
  const response = await axios.post(
    `${API_URL}/verify-email`,
    {
      email,
      validation_number,
    },
    {
      withCredentials: true,
    },
  )
  return response.data
}

export const meaninglessCookieSet = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/pre-login`,
      {},
      {
        withCredentials: true, // 쿠키를 포함하도록 설정
      },
    )

    // console.log('응답 헤더:', response.headers)
    // console.log('쿠키:', response.headers['set-cookie'])

    return response.data
  } catch (error) {
    return null
  }
}
