import { me } from "@/api/auth";
import { getHistory } from "@/api/detection_log";
import { useQuery } from "@tanstack/react-query";
import { cookies } from "next/headers";
import NotLogInHomePage from "../components/NotLogInHomePage";
import MainHistoryPage from "./MainHistoryPage";

const HistoryPage = async () => {
    const cookieStore = await cookies()
    const cookieString = cookieStore.getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ')

    const userSession = await me(cookieString)
    console.log("userSession in HistoryPage: ", userSession)

    return (
        <>
            {userSession === null ? <NotLogInHomePage /> : <MainHistoryPage cookieString={cookieString} />}
        </>
    )
}

export default HistoryPage;