import { me } from "@/api/auth";
import { cookies } from "next/headers";
import NotLogInHomePage from "../components/NotLogInHomePage";
import MainHistoryPage from "./MainHistoryPage";
import Navbar from "../components/Navbar";

const HistoryPage = async () => {
    const cookieStore = await cookies()
    const cookieString = cookieStore.getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ')

    const userSession = await me(cookieString)
    console.log("userSession in HistoryPage: ", userSession)

    return (
        <>
            {userSession && <Navbar cookieString={cookieString} />}
            {userSession === null ? <NotLogInHomePage /> : <MainHistoryPage cookieString={cookieString} />}
        </>
    )
}

export default HistoryPage;