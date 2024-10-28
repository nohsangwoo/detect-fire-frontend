import { me } from '@/api/auth';
import LoginMainPage from './LoginMainPage';
import LoggedImLoginMainPage from './LoggedImLoginMainPage';
import { cookies } from 'next/headers';

export default async function Login() {

    // const initCookie = async () => {
    //     'use server'
    //     return (await cookies()).set('testSession', 'testValue')
    // }
    // await initCookie()

    // Fetch data from external API
    // 쿠키 정보를 ssr에서 같이 보낼 수 없기때문에 하는 설정.
    const cookieStore = await cookies()
    const cookieString = cookieStore.getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ')

    const meResponse = await me(cookieString)
    console.log("meResponse: ", meResponse)


    // cookieStore.set('testSession', 'testValue')

    // async function serverAction() {
    //     'use server'
    //     console.log("serverAction is called")
    //     const meResponse = await me()
    //     console.log("meResponse: ", meResponse)
    //     return meResponse
    // }



    return (
        <>
            {/* <button onClick={serverAction}>serverAction</button> */}
            {meResponse === null ? <LoginMainPage /> : <LoggedImLoginMainPage />}
        </>

    );
}
