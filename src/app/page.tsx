
import { cookies } from "next/headers";
import { me } from "@/api/auth";
import MainHomePage from "./components/MainHomePage";
import Navbar from "./components/Navbar";
import NotLogInHomePage from "./components/NotLogInHomePage";



export default async function Home() {

  const cookieStore = await cookies()
  const cookieString = cookieStore.getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ')

  const userSession = await me(cookieString)
  console.log("userSession: ", userSession)

  return (
    <>
      {userSession && <Navbar cookieString={cookieString} />}
      {userSession === null ? <NotLogInHomePage /> : <MainHomePage userSession={userSession} />}
    </>
  );
}
