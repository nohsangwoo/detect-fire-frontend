import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL


interface GetHistoryParams {
  cookies?: string
  page: number
  pageSize: number
}
export const getHistory = async ({ cookies, page, pageSize }: GetHistoryParams) => {
  const response = await axios.get(`${API_URL}/gethistory`, {
    params: {
      page,
      page_size: pageSize,
    },
    withCredentials: true,
    headers: cookies
      ? {
          Cookie: cookies,
        }
      : undefined,
  })
  return response.data
}
