import { me } from "@/api/auth"
import Navbar from "@/components/Navbar"
import { cookies } from "next/headers"
import React from "react"

// 서버 컴포넌트
async function NavLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const cookieString = cookieStore.getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ')
    const userSession = await me(cookieString)

    return (
        <>
            <Navbar userSession={userSession} />
            {React.Children.map(children, child =>
                React.isValidElement(child)
                    ? React.cloneElement(child as React.ReactElement<any>, { userSession })
                    : child
            )}
        </>
    )
}

export default NavLayout
